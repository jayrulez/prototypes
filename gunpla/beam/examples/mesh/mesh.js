import {
  Element,
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
uniform sampler2D img;
varying highp vec2 v_UV;
varying highp vec3 vLighting;

void main() {
  highp vec4 texelColor = texture2D(img, v_UV);
  gl_FragColor = texelColor;
}
`

export class MeshPlugin extends ShadePlugin {
  constructor () {
    super()

    const { vec2, vec3, vec4, mat4, sampler2D } = ShaderTypes
    this.shaderSchema.vertexShader = vertexShader
    this.shaderSchema.fragmentShader = fragmentShader
    this.shaderSchema.attributes = {
      a_UV: vec2,
      a_Position: vec3,
      a_Normal: vec4
    }
    this.shaderSchema.uniforms = {
      u_MVPMatrix: mat4,
      u_ModelMatrix: mat4,
      u_NormalMatrix: mat4,
      img: sampler2D
    }

    const { attribute, uniform } = PropTypes
    this.propSchema = {
      a_Position: { type: attribute, n: 3 },
      a_Normal: { type: attribute, n: 3 },
      a_UV: { type: attribute, n: 2 },
      index: { type: attribute, index: true },
      img: { type: uniform }
    }
  }

  propsByElement ({ props }) {
    const { attributeInfos, indicesInfo } = props.bufferInfos
    return {
      a_Position: attributeInfos[1].data,
      a_Normal: attributeInfos[0].data,
      a_UV: attributeInfos[2].data,
      index: indicesInfo.data,
      img: props.image
    }
  }

  propsByGlobals (globals) {
    const modelMat = rotate([], create(), Math.PI, [0, 1, 0])
    const viewProjectionMat = multiply([], globals.perspective, globals.camera)
    const mvpMat = multiply([], viewProjectionMat, modelMat)

    return {
      u_NormalMatrix: create(),
      u_ModelMatrix: modelMat,
      u_MVPMatrix: mvpMat
    }
  }
}

export class MeshElement extends Element {
  constructor (props) {
    super(props)
    this.plugins = { MeshPlugin }
  }
}
