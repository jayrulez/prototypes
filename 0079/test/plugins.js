import { ShadePlugin, ShaderTypes, BufferTypes } from './libs.js'

const vertexShader = `
attribute vec4 pos;
attribute vec4 color;

uniform mat4 modelMat;
uniform mat4 viewMat;
uniform mat4 projectionMat;

varying highp vec4 vColor;

void main() {
  gl_Position = projectionMat * viewMat * modelMat * pos;
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

    const { float, int } = BufferTypes
    this.bufferSchema = {
      pos: { type: float, n: 3 },
      color: { type: float, n: 4 },
      index: { type: int, index: true }
    }

    this.elementSchema = {}
  }
}
