import { ShadePlugin, ShaderTypes } from './libs.js'

const vertexShader = `
attribute vec3 pos;
attribute vec4 color;

uniform mat4 modelMat;
uniform mat4 viewMat;
uniform mat4 projectionMat;

varying highp vec4 vColor;

void main() {
  gl_Position = projectionMat * viewMat * modelMat * vec4(pos, 1);
  vColor = color;
}
`

const fragmentShader = `
varying highp vec4 vColor;

void main() {
  gl_FragColor = vColor;
}
`

export class CubePlugin extends ShadePlugin {
  constructor () {
    super()

    const { vec3, vec4, mat4 } = ShaderTypes
    this.programSchema.vertexShader = vertexShader
    this.programSchema.fragmentShader = fragmentShader
    this.programSchema.attributes = {
      pos: vec3,
      color: vec4
    }
    this.programSchema.uniforms = {
      modelMat: mat4,
      viewMat: mat4,
      projectionMat: mat4
    }
    this.elementSchema = {}
  }
}
