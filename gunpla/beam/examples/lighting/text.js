import {
  createElement,
  ShadePlugin,
  ShaderTypes,
  PropTypes
} from '../../src/index.js'
import { create } from '../common/mat4.js'

const vertexShader = `
precision highp float;

attribute vec4 pos;
attribute vec4 normal;

uniform mat4 viewMat;
uniform mat4 projectionMat;

varying vec4 vNormal;

void main() {
  vNormal = normal;
  gl_Position = projectionMat * viewMat * pos;
}
`

const fragmentShader = `
precision highp float;

struct DirectionalLight {
  vec3 direction;
  vec4 color;
  float strength;
};
uniform DirectionalLight dirLight;
uniform mat4 normalMat;

varying vec4 vNormal;

void main() {
  vec3 normalDir = normalize(vec3(normalMat * vNormal));
  float nDotL = max(dot(normalDir, dirLight.direction), 0.0);
  vec4 dirLight = vec4(dirLight.color.rgb * nDotL * dirLight.strength, dirLight.color.a);
  gl_FragColor = dirLight;
}
`

export class TextPlugin extends ShadePlugin {
  constructor () {
    super()

    const { float, vec3, vec4, mat4 } = ShaderTypes
    this.vertexShader = vertexShader
    this.fragmentShader = fragmentShader
    this.shaderSchema.attributes = {
      pos: vec3,
      normal: vec4
    }
    this.shaderSchema.uniforms = {
      viewMat: mat4,
      projectionMat: mat4,
      normalMat: mat4,
      'dirLight.direction': vec3,
      'dirLight.color': vec4,
      'dirLight.strength': float
    }

    const { buffer } = PropTypes
    this.propSchema = {
      pos: { type: buffer, n: 3 },
      normal: { type: buffer, n: 3 },
      index: { type: buffer, index: true }
    }
  }

  propsByElement ({ state }) {
    const { positions, normals, indices } = state
    return { pos: positions, normal: normals, index: indices }
  }

  propsByGlobals (globals) {
    const {
      dirLightDirection = [1, 0, 1],
      dirLightStrength = 0.5
    } = globals

    return {
      normalMat: create(),
      viewMat: globals.camera,
      projectionMat: globals.perspective,
      'dirLight.direction': dirLightDirection,
      'dirLight.color': [1, 1, 1, 1],
      'dirLight.strength': dirLightStrength
    }
  }
}

export const createTextElement = data => createElement(data, TextPlugin)
