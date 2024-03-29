import {
  createElement,
  ShadePlugin,
  ShaderTypes,
  PropTypes
} from '../../src/index.js'
import { create, multiply, rotate } from '../common/mat4.js'

const vertexShader = `
#define USE_IBL 1
#define HAS_NORMALS 1
#define HAS_UV 1
#define HAS_BASECOLORMAP 1
#define HAS_METALROUGHNESSMAP 1
#define HAS_NORMALMAP 1
#define HAS_EMISSIVEMAP 1
#define HAS_OCCLUSIONMAP 1
#define USE_TEX_LOD 1
attribute vec4 a_Position;
#ifdef HAS_NORMALS
attribute vec4 a_Normal;
#endif
#ifdef HAS_TANGENTS
attribute vec4 a_Tangent;
#endif
#ifdef HAS_UV
attribute vec2 a_UV;
#endif

uniform mat4 u_MVPMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_NormalMatrix;

varying vec3 v_Position;
varying vec2 v_UV;

#ifdef HAS_NORMALS
#ifdef HAS_TANGENTS
varying mat3 v_TBN;
#else
varying vec3 v_Normal;
#endif
#endif

void main()
{
  vec4 pos = u_ModelMatrix * a_Position;
  v_Position = vec3(pos.xyz) / pos.w;

  #ifdef HAS_NORMALS
  #ifdef HAS_TANGENTS
  vec3 normalW = normalize(vec3(u_NormalMatrix * vec4(a_Normal.xyz, 0.0)));
  vec3 tangentW = normalize(vec3(u_ModelMatrix * vec4(a_Tangent.xyz, 0.0)));
  vec3 bitangentW = cross(normalW, tangentW) * a_Tangent.w;
  v_TBN = mat3(tangentW, bitangentW, normalW);
  #else // HAS_TANGENTS != 1
  v_Normal = normalize(vec3(u_ModelMatrix * vec4(a_Normal.xyz, 0.0)));
  #endif
  #endif

  #ifdef HAS_UV
  v_UV = a_UV;
  #else
  v_UV = vec2(0.,0.);
  #endif

  gl_Position = u_MVPMatrix * a_Position; // needs w for proper perspective correction
}
`

const fragmentShader = `
#define USE_IBL 1
#define HAS_NORMALS 1
#define HAS_UV 1
#define HAS_BASECOLORMAP 1
#define HAS_METALROUGHNESSMAP 1
#define HAS_NORMALMAP 1
#define HAS_EMISSIVEMAP 1
#define HAS_OCCLUSIONMAP 1
#define USE_TEX_LOD 1
#define NR_POINT_LIGHTS 3
//
// This fragment shader defines a reference implementation for Physically Based Shading of
// a microfacet surface material defined by a glTF model.
//
// References:
// [1] Real Shading in Unreal Engine 4
//     http://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf
// [2] Physically Based Shading at Disney
//     http://blog.selfshadow.com/publications/s2012-shading-course/burley/s2012_pbs_disney_brdf_notes_v3.pdf
// [3] README.md - Environment Maps
//     https://github.com/KhronosGroup/glTF-WebGL-PBR/#environment-maps
// [4] "An Inexpensive BRDF Model for Physically based Rendering" by Christophe Schlick
//     https://www.cs.virginia.edu/~jdl/bib/appearance/analytic%20models/schlick94b.pdf
#extension GL_EXT_shader_texture_lod: enable
#extension GL_OES_standard_derivatives : enable

precision highp float;

struct PointLight {
  vec3 direction;
  vec3 color;
  float strength;
};
uniform PointLight u_Lights[NR_POINT_LIGHTS];

#ifdef USE_IBL
uniform samplerCube u_DiffuseEnvSampler;
uniform samplerCube u_SpecularEnvSampler;
uniform sampler2D u_brdfLUT;
#endif

#ifdef HAS_BASECOLORMAP
uniform sampler2D u_BaseColorSampler;
#endif
#ifdef HAS_NORMALMAP
uniform sampler2D u_NormalSampler;
uniform float u_NormalScale;
#endif
#ifdef HAS_EMISSIVEMAP
uniform sampler2D u_EmissiveSampler;
uniform vec3 u_EmissiveFactor;
#endif
#ifdef HAS_METALROUGHNESSMAP
uniform sampler2D u_MetallicRoughnessSampler;
#endif
#ifdef HAS_OCCLUSIONMAP
uniform sampler2D u_OcclusionSampler;
uniform float u_OcclusionStrength;
#endif

uniform vec2 u_MetallicRoughnessValues;
uniform vec4 u_BaseColorFactor;

uniform vec3 u_Camera;

// debugging flags used for shader output of intermediate PBR variables
uniform vec4 u_ScaleDiffBaseMR;
uniform vec4 u_ScaleFGDSpec;
uniform vec4 u_ScaleIBLAmbient;

varying vec3 v_Position;

varying vec2 v_UV;

#ifdef HAS_NORMALS
#ifdef HAS_TANGENTS
varying mat3 v_TBN;
#else
varying vec3 v_Normal;
#endif
#endif

// Encapsulate the various inputs used by the various functions in the shading equation
// We store values in this struct to simplify the integration of alternative implementations
// of the shading terms, outlined in the Readme.MD Appendix.
struct PBRInfo
{
  float NdotL;                  // cos angle between normal and light direction
  float NdotV;                  // cos angle between normal and view direction
  float NdotH;                  // cos angle between normal and half vector
  float LdotH;                  // cos angle between light direction and half vector
  float VdotH;                  // cos angle between view direction and half vector
  float perceptualRoughness;    // roughness value, as authored by the model creator (input to shader)
  float metalness;              // metallic value at the surface
  vec3 reflectance0;            // full reflectance color (normal incidence angle)
  vec3 reflectance90;           // reflectance color at grazing angle
  float alphaRoughness;         // roughness mapped to a more linear change in the roughness (proposed by [2])
  vec3 diffuseColor;            // color contribution from diffuse lighting
  vec3 specularColor;           // color contribution from specular lighting
};

const float M_PI = 3.141592653589793;
const float c_MinRoughness = 0.04;

vec4 SRGBtoLINEAR(vec4 srgbIn)
{
  #ifdef MANUAL_SRGB
  #ifdef SRGB_FAST_APPROXIMATION
  vec3 linOut = pow(srgbIn.xyz,vec3(2.2));
  #else //SRGB_FAST_APPROXIMATION
  vec3 bLess = step(vec3(0.04045),srgbIn.xyz);
  vec3 linOut = mix( srgbIn.xyz/vec3(12.92), pow((srgbIn.xyz+vec3(0.055))/vec3(1.055),vec3(2.4)), bLess );
  #endif //SRGB_FAST_APPROXIMATION
  return vec4(linOut,srgbIn.w);;
  #else //MANUAL_SRGB
  return srgbIn;
  #endif //MANUAL_SRGB
}

// Find the normal for this fragment, pulling either from a predefined normal map
// or from the interpolated mesh normal and tangent attributes.
vec3 getNormal()
{
  // Retrieve the tangent space matrix
  #ifndef HAS_TANGENTS
  vec3 pos_dx = dFdx(v_Position);
  vec3 pos_dy = dFdy(v_Position);
  vec3 tex_dx = dFdx(vec3(v_UV, 0.0));
  vec3 tex_dy = dFdy(vec3(v_UV, 0.0));
  vec3 t = (tex_dy.t * pos_dx - tex_dx.t * pos_dy) / (tex_dx.s * tex_dy.t - tex_dy.s * tex_dx.t);

  #ifdef HAS_NORMALS
  vec3 ng = normalize(v_Normal);
  #else
  vec3 ng = cross(pos_dx, pos_dy);
  #endif

  t = normalize(t - ng * dot(ng, t));
  vec3 b = normalize(cross(ng, t));
  mat3 tbn = mat3(t, b, ng);
  #else // HAS_TANGENTS
  mat3 tbn = v_TBN;
  #endif

  #ifdef HAS_NORMALMAP
  vec3 n = texture2D(u_NormalSampler, v_UV).rgb;
  n = normalize(tbn * ((2.0 * n - 1.0) * vec3(u_NormalScale, u_NormalScale, 1.0)));
  #else
  // The tbn matrix is linearly interpolated, so we need to re-normalize
  vec3 n = normalize(tbn[2].xyz);
  #endif

  return n;
}

// Calculation of the lighting contribution from an optional Image Based Light source.
// Precomputed Environment Maps are required uniform inputs and are computed as outlined in [1].
// See our README.md on Environment Maps [3] for additional discussion.
#ifdef USE_IBL
vec3 getIBLContribution(PBRInfo pbrInputs, vec3 n, vec3 reflection)
{
  float mipCount = 9.0; // resolution of 512x512
  float lod = (pbrInputs.perceptualRoughness * mipCount);
  // retrieve a scale and bias to F0. See [1], Figure 3
  vec3 brdf = SRGBtoLINEAR(texture2D(u_brdfLUT, vec2(pbrInputs.NdotV, 1.0 - pbrInputs.perceptualRoughness))).rgb;
  vec3 diffuseLight = SRGBtoLINEAR(textureCube(u_DiffuseEnvSampler, n)).rgb;

  #ifdef USE_TEX_LOD
  vec3 specularLight = SRGBtoLINEAR(textureCubeLodEXT(u_SpecularEnvSampler, reflection, lod)).rgb;
  #else
  vec3 specularLight = SRGBtoLINEAR(textureCube(u_SpecularEnvSampler, reflection)).rgb;
  #endif

  vec3 diffuse = diffuseLight * pbrInputs.diffuseColor;
  vec3 specular = specularLight * (pbrInputs.specularColor * brdf.x + brdf.y);

  // For presentation, this allows us to disable IBL terms
  diffuse *= u_ScaleIBLAmbient.x;
  specular *= u_ScaleIBLAmbient.y;

  return diffuse + specular;
}
#endif

// Basic Lambertian diffuse
// Implementation from Lambert's Photometria https://archive.org/details/lambertsphotome00lambgoog
// See also [1], Equation 1
vec3 diffuse(PBRInfo pbrInputs)
{
  return pbrInputs.diffuseColor / M_PI;
}

// The following equation models the Fresnel reflectance term of the spec equation (aka F())
// Implementation of fresnel from [4], Equation 15
vec3 specularReflection(PBRInfo pbrInputs)
{
  return pbrInputs.reflectance0 + (pbrInputs.reflectance90 - pbrInputs.reflectance0) * pow(clamp(1.0 - pbrInputs.VdotH, 0.0, 1.0), 5.0);
}

// This calculates the specular geometric attenuation (aka G()),
// where rougher material will reflect less light back to the viewer.
// This implementation is based on [1] Equation 4, and we adopt their modifications to
// alphaRoughness as input as originally proposed in [2].
float geometricOcclusion(PBRInfo pbrInputs)
{
  float NdotL = pbrInputs.NdotL;
  float NdotV = pbrInputs.NdotV;
  float r = pbrInputs.alphaRoughness;

  float attenuationL = 2.0 * NdotL / (NdotL + sqrt(r * r + (1.0 - r * r) * (NdotL * NdotL)));
  float attenuationV = 2.0 * NdotV / (NdotV + sqrt(r * r + (1.0 - r * r) * (NdotV * NdotV)));
  return attenuationL * attenuationV;
}

// The following equation(s) model the distribution of microfacet normals across the area being drawn (aka D())
// Implementation from "Average Irregularity Representation of a Roughened Surface for Ray Reflection" by T. S. Trowbridge, and K. P. Reitz
// Follows the distribution function recommended in the SIGGRAPH 2013 course notes from EPIC Games [1], Equation 3.
float microfacetDistribution(PBRInfo pbrInputs)
{
  float roughnessSq = pbrInputs.alphaRoughness * pbrInputs.alphaRoughness;
  float f = (pbrInputs.NdotH * roughnessSq - pbrInputs.NdotH) * pbrInputs.NdotH + 1.0;
  return roughnessSq / (M_PI * f * f);
}

void main()
{
  // Metallic and Roughness material properties are packed together
  // In glTF, these factors can be specified by fixed scalar values
  // or from a metallic-roughness map
  float perceptualRoughness = u_MetallicRoughnessValues.y;
  float metallic = u_MetallicRoughnessValues.x;
  #ifdef HAS_METALROUGHNESSMAP
  // Roughness is stored in the 'g' channel, metallic is stored in the 'b' channel.
  // This layout intentionally reserves the 'r' channel for (optional) occlusion map data
  vec4 mrSample = texture2D(u_MetallicRoughnessSampler, v_UV);
  perceptualRoughness = mrSample.g * perceptualRoughness;
  metallic = mrSample.b * metallic;
  #endif
  perceptualRoughness = clamp(perceptualRoughness, c_MinRoughness, 1.0);
  metallic = clamp(metallic, 0.0, 1.0);
  // Roughness is authored as perceptual roughness; as is convention,
  // convert to material roughness by squaring the perceptual roughness [2].
  float alphaRoughness = perceptualRoughness * perceptualRoughness;

  // The albedo may be defined from a base texture or a flat color
  #ifdef HAS_BASECOLORMAP
  vec4 baseColor = SRGBtoLINEAR(texture2D(u_BaseColorSampler, v_UV)) * u_BaseColorFactor;
  #else
  vec4 baseColor = u_BaseColorFactor;
  #endif

  vec3 f0 = vec3(0.04);
  vec3 diffuseColor = baseColor.rgb * (vec3(1.0) - f0);
  diffuseColor *= 1.0 - metallic;
  vec3 specularColor = mix(f0, baseColor.rgb, metallic);

  // Compute reflectance.
  float reflectance = max(max(specularColor.r, specularColor.g), specularColor.b);

  // For typical incident reflectance range (between 4% to 100%) set the grazing reflectance to 100% for typical fresnel effect.
  // For very low reflectance range on highly diffuse objects (below 4%), incrementally reduce grazing reflecance to 0%.
  float reflectance90 = clamp(reflectance * 25.0, 0.0, 1.0);
  vec3 specularEnvironmentR0 = specularColor.rgb;
  vec3 specularEnvironmentR90 = vec3(1.0, 1.0, 1.0) * reflectance90;

  vec3 n = getNormal();                             // normal at surface point
  vec3 v = normalize(u_Camera - v_Position);        // Vector from surface point to camera
  vec3 reflection = -normalize(reflect(v, n));

  vec3 color = vec3(0, 0, 0);
  float NdotL, NdotV, NdotH, LdotH, VdotH;
  PBRInfo pbrInputs;
  vec3 F;
  float G, D;
  vec3 diffuseContrib, specContrib;

  for(int i = 0; i < NR_POINT_LIGHTS; ++i) {
    vec3 l = normalize(u_Lights[i].direction);      // Vector from surface point to light
    vec3 h = normalize(l + v);                      // Half vector between both l and v

    NdotL = clamp(dot(n, l), 0.001, 1.0);
    NdotV = clamp(abs(dot(n, v)), 0.001, 1.0);
    NdotH = clamp(dot(n, h), 0.0, 1.0);
    LdotH = clamp(dot(l, h), 0.0, 1.0);
    VdotH = clamp(dot(v, h), 0.0, 1.0);

    pbrInputs = PBRInfo(
      NdotL,
      NdotV,
      NdotH,
      LdotH,
      VdotH,
      perceptualRoughness,
      metallic,
      specularEnvironmentR0,
      specularEnvironmentR90,
      alphaRoughness,
      diffuseColor,
      specularColor
    );
    // Calculate the shading terms for the microfacet specular shading model
    F = specularReflection(pbrInputs);
    G = geometricOcclusion(pbrInputs);
    D = microfacetDistribution(pbrInputs);
    // Calculation of analytical lighting contribution
    diffuseContrib = (1.0 - F) * diffuse(pbrInputs);
    specContrib = F * G * D / (4.0 * NdotL * NdotV);
    // Obtain final intensity as reflectance (BRDF) scaled by the energy of the light (cosine law)
    vec3 lightColor = NdotL * u_Lights[i].color * (diffuseContrib + specContrib);
    lightColor *= u_Lights[i].strength;
    color += lightColor;
  }

  // Calculate lighting contribution from image based lighting source (IBL)
  #ifdef USE_IBL
  color += getIBLContribution(pbrInputs, n, reflection);
  #endif

  // Apply optional PBR terms for additional (optional) shading
  #ifdef HAS_OCCLUSIONMAP
  float ao = texture2D(u_OcclusionSampler, v_UV).r;
  color = mix(color, color * ao, u_OcclusionStrength);
  #endif

  #ifdef HAS_EMISSIVEMAP
  vec3 emissive = SRGBtoLINEAR(texture2D(u_EmissiveSampler, v_UV)).rgb * u_EmissiveFactor;
  color += emissive;
  #endif

  // This section uses mix to override final color for reference app visualization
  // of various parameters in the lighting equation.
  color = mix(color, F, u_ScaleFGDSpec.x);
  color = mix(color, vec3(G), u_ScaleFGDSpec.y);
  color = mix(color, vec3(D), u_ScaleFGDSpec.z);
  color = mix(color, specContrib, u_ScaleFGDSpec.w);

  color = mix(color, diffuseContrib, u_ScaleDiffBaseMR.x);
  color = mix(color, baseColor.rgb, u_ScaleDiffBaseMR.y);
  color = mix(color, vec3(metallic), u_ScaleDiffBaseMR.z);
  color = mix(color, vec3(perceptualRoughness), u_ScaleDiffBaseMR.w);

  gl_FragColor = vec4(pow(color,vec3(1.0/2.2)), baseColor.a);
}
`

export class MeshPlugin extends ShadePlugin {
  constructor () {
    super()

    const {
      float, vec2, vec3, vec4, mat4, sampler2D, samplerCube
    } = ShaderTypes
    this.vertexShader = vertexShader
    this.fragmentShader = fragmentShader
    this.shaderSchema.attributes = {
      a_UV: vec2,
      a_Position: vec3,
      a_Normal: vec4
    }
    this.shaderSchema.uniforms = {
      u_MVPMatrix: mat4,
      u_ModelMatrix: mat4,
      u_NormalMatrix: mat4,
      'u_Lights[0].direction': vec3,
      'u_Lights[0].color': vec3,
      'u_Lights[0].strength': float,
      'u_Lights[1].direction': vec3,
      'u_Lights[1].color': vec3,
      'u_Lights[1].strength': float,
      'u_Lights[2].direction': vec3,
      'u_Lights[2].color': vec3,
      'u_Lights[2].strength': float,
      u_DiffuseEnvSampler: samplerCube,
      u_SpecularEnvSampler: samplerCube,
      u_brdfLUT: sampler2D,
      u_BaseColorSampler: sampler2D,
      u_NormalSampler: sampler2D,
      u_NormalScale: float,
      u_EmissiveSampler: sampler2D,
      u_EmissiveFactor: vec3,
      u_MetallicRoughnessSampler: sampler2D,
      u_OcclusionSampler: sampler2D,
      u_OcclusionStrength: float,
      u_MetallicRoughnessValues: vec2,
      u_BaseColorFactor: vec4,
      u_Camera: vec3,
      u_ScaleDiffBaseMR: vec4,
      u_ScaleFGDSpec: vec4,
      u_ScaleIBLAmbient: vec4
    }

    const { buffer, texture } = PropTypes
    this.propSchema = {
      index: { type: buffer, index: true },
      a_Position: { type: buffer, n: 3 },
      a_Normal: { type: buffer, n: 3 },
      a_UV: { type: buffer, n: 2 },
      u_DiffuseEnvSampler: { type: texture, unit: 0, cube: true },
      u_SpecularEnvSampler: { type: texture, unit: 1, cube: true },
      u_brdfLUT: { type: texture, unit: 2, srgb: true },
      u_BaseColorSampler: { type: texture, unit: 3 },
      u_NormalSampler: { type: texture, unit: 4 },
      u_EmissiveSampler: { type: texture, unit: 5 },
      u_MetallicRoughnessSampler: { type: texture, unit: 6 },
      u_OcclusionSampler: { type: texture, unit: 7 }
    }
  }

  propsByElement ({ state }) {
    const { attributeInfos, indicesInfo } = state.bufferInfos
    const { images } = state

    return {
      a_Position: attributeInfos[1].data,
      a_Normal: attributeInfos[0].data,
      a_UV: attributeInfos[2].data,
      u_BaseColorSampler: images[0],
      u_NormalSampler: images[1],
      u_MetallicRoughnessSampler: images[2],
      u_EmissiveSampler: images[3],
      u_OcclusionSampler: images[4],
      index: indicesInfo.data
    }
  }

  propsByGlobals (globals) {
    const {
      brdf,
      camera,
      cameraEye,
      cubeMaps,
      modelRotate = [],
      metallic = 1,
      roughness = 1,
      baseColorFactor = 1,
      scaleIBLAmbient = 1,
      light0X = 0,
      light0Y = 0,
      light0Z = 0,
      light0Strength = 1,
      light0Color = [1, 1, 1],
      light1X = 0,
      light1Y = 0,
      light1Z = 0,
      light1Strength = 1,
      light1Color = [1, 1, 1],
      light2X = 0,
      light2Y = 0,
      light2Z = 0,
      light2Strength = 1,
      light2Color = [1, 1, 1],
      perspective
    } = globals
    const [rx = 0, ry = 0, rz = 0] = modelRotate
    const modelMat = create()
    rotate(modelMat, modelMat, rx / 180 * Math.PI, [1, 0, 0])
    rotate(modelMat, modelMat, ry / 180 * Math.PI, [0, 1, 0])
    rotate(modelMat, modelMat, rz / 180 * Math.PI, [0, 0, 1])

    const viewProjectionMat = multiply([], perspective, camera)
    const mvpMat = multiply([], viewProjectionMat, modelMat)

    return {
      u_NormalMatrix: create(),
      u_ModelMatrix: modelMat,
      u_MVPMatrix: mvpMat,
      u_DiffuseEnvSampler: cubeMaps[0],
      u_SpecularEnvSampler: cubeMaps[1],
      'u_Lights[0].direction': [light0X, light0Y, light0Z],
      'u_Lights[0].color': light0Color,
      'u_Lights[0].strength': light0Strength,
      'u_Lights[1].direction': [light1X, light1Y, light1Z],
      'u_Lights[1].color': light1Color,
      'u_Lights[1].strength': light1Strength,
      'u_Lights[2].direction': [light2X, light2Y, light2Z],
      'u_Lights[2].color': light2Color,
      'u_Lights[2].strength': light2Strength,
      u_LightCount: 3,
      u_NormalScale: 1.0,
      u_EmissiveFactor: [1.0, 1.0, 1.0],
      u_OcclusionStrength: 1.0,
      u_MetallicRoughnessValues: [metallic, roughness],
      u_BaseColorFactor: [1.0, 1.0, 1.0, 1.0].map(x => x * baseColorFactor),
      u_brdfLUT: brdf,
      u_Camera: cameraEye,
      u_ScaleDiffBaseMR: [0.0, 0.0, 0.0, 0.0],
      u_ScaleFGDSpec: [0.0, 0.0, 0.0, 0.0],
      u_ScaleIBLAmbient: [1.0, 1.0, 1.0, 1.0].map(x => x * scaleIBLAmbient)
    }
  }
}

export const createMeshElement = data => createElement(data, MeshPlugin)
