import {
  createElement,
  ShadePlugin,
  ShaderTypes,
  PropTypes
} from '../../src/index.js'
import { create } from '../common/mat4.js'

const vertexShader = `
attribute vec4 pos;
attribute vec4 normal;

uniform mat4 viewMat;
uniform mat4 projectionMat;
uniform mat4 normalMat;
uniform vec3 directionalLightDir;

varying highp vec4 vColor;

void main() {
  vec4 color = vec4(1, 0, 0, 1);
  vec3 normalDir = normalize(vec3(normalMat * normal));
  float nDotL = max(dot(normalDir, directionalLightDir), 0.0);
  vColor = vec4(color.rgb * nDotL, color.a);
  gl_Position = projectionMat * viewMat * pos;
}
`

const fragmentShader = `
varying highp vec4 vColor;

void main() {
  gl_FragColor = vColor;
}
`

export class TextPlugin extends ShadePlugin {
  constructor () {
    super()

    const { vec3, vec4, mat4 } = ShaderTypes
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
      directionalLightDir: vec3
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
    const { directionalLightDir = [1, 0, 1] } = globals
    return {
      normalMat: create(),
      viewMat: globals.camera,
      projectionMat: globals.perspective,
      directionalLightDir
    }
  }
}

export const createTextElement = data => createElement(data, TextPlugin)
