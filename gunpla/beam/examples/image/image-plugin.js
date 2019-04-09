import {
  ShadePlugin,
  ShaderTypes,
  BufferTypes
} from '../../src/index.js'

const vertexShader = `
attribute vec4 pos;

uniform mat4 viewMat;
uniform mat4 projectionMat;

varying highp vec4 vColor;

void main() {
  gl_Position = projectionMat * viewMat * pos;
  vColor = vec4(1, 0, 0, 1);
}
`

const fragmentShader = `
varying highp vec4 vColor;

void main() {
  gl_FragColor = vColor;
}
`

const basePositions = [
  -1.0, -1.0, 1.0,
  1.0, -1.0, 1.0,
  1.0, 1.0, 1.0,
  -1.0, 1.0, 1.0
]

const index = [0, 1, 2, 0, 2, 3]

export class ImagePlugin extends ShadePlugin {
  constructor () {
    super()

    const { vec3, mat4 } = ShaderTypes
    this.programSchema.vertexShader = vertexShader
    this.programSchema.fragmentShader = fragmentShader
    this.programSchema.attributes = {
      pos: vec3
    }
    this.programSchema.uniforms = {
      viewMat: mat4,
      projectionMat: mat4
    }

    const { float, int } = BufferTypes
    this.bufferSchema = {
      pos: { type: float, n: 3 },
      index: { type: int, index: true }
    }
  }

  createBufferProps (element) {
    const p = element.state.position
    const pos = []
    for (let i = 0; i < basePositions.length; i += 3) {
      pos.push(basePositions[i] + p[0])
      pos.push(basePositions[i + 1] + p[1])
      pos.push(basePositions[i + 2] + p[2])
    }
    return { pos, index }
  }

  createUniformProps (globals) {
    return {
      viewMat: globals.camera,
      projectionMat: globals.perspective
    }
  }
}
