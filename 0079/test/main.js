import {
  Renderer,
  Element,
  ShadePlugin,
  ShaderTypes,
  BufferTypes,
  setCamera,
  setPerspective
} from './libs.js'

const vertexShader = `
attribute vec4 pos;
attribute vec4 color;

uniform mat4 viewMat;
uniform mat4 projectionMat;

varying highp vec4 vColor;

void main() {
  gl_Position = projectionMat * viewMat * pos;
  vColor = color;
}
`

const fragmentShader = `
varying highp vec4 vColor;

void main() {
  gl_FragColor = vColor;
}
`

const basePositions = [
  // Front face
  -1.0, -1.0, 1.0,
  1.0, -1.0, 1.0,
  1.0, 1.0, 1.0,
  -1.0, 1.0, 1.0,

  // Back face
  -1.0, -1.0, -1.0,
  -1.0, 1.0, -1.0,
  1.0, 1.0, -1.0,
  1.0, -1.0, -1.0,

  // Top face
  -1.0, 1.0, -1.0,
  -1.0, 1.0, 1.0,
  1.0, 1.0, 1.0,
  1.0, 1.0, -1.0,

  // Bottom face
  -1.0, -1.0, -1.0,
  1.0, -1.0, -1.0,
  1.0, -1.0, 1.0,
  -1.0, -1.0, 1.0,

  // Right face
  1.0, -1.0, -1.0,
  1.0, 1.0, -1.0,
  1.0, 1.0, 1.0,
  1.0, -1.0, 1.0,

  // Left face
  -1.0, -1.0, -1.0,
  -1.0, -1.0, 1.0,
  -1.0, 1.0, 1.0,
  -1.0, 1.0, -1.0
]

const faceColors = [
  [1.0, 1.0, 1.0, 1.0], // White
  [1.0, 0.0, 0.0, 1.0], // Red
  [0.0, 1.0, 0.0, 1.0], // Green
  [0.0, 0.0, 1.0, 1.0], // Blue
  [1.0, 1.0, 0.0, 1.0], // Yellow
  [1.0, 0.0, 1.0, 1.0] // Purple
]
let color = []
for (let i = 0; i < faceColors.length; i++) {
  const c = faceColors[i]
  color = color.concat(c, c, c, c)
}

const index = [
  0, 1, 2, 0, 2, 3, // Front
  4, 5, 6, 4, 6, 7, // Back
  8, 9, 10, 8, 10, 11, // Top
  12, 13, 14, 12, 14, 15, // Bottom
  16, 17, 18, 16, 18, 19, // Right
  20, 21, 22, 20, 22, 23 // Left
]

class CubePlugin extends ShadePlugin {
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
      viewMat: mat4,
      projectionMat: mat4
    }

    const { float, int } = BufferTypes
    this.bufferSchema = {
      length: 0,
      pos: { type: float, n: 3 },
      color: { type: float, n: 4 },
      index: { type: int, index: true }
    }

    this.elementSchema = {}
  }

  createBufferProps (element) {
    const p = element.state.position
    const pos = []
    for (let i = 0; i < basePositions.length; i += 3) {
      pos.push(basePositions[i] + p[0])
      pos.push(basePositions[i + 1] + p[1])
      pos.push(basePositions[i + 2] + p[2])
    }
    return { pos, color, index }
  }

  createUniformProps (globals) {
    return {
      viewMat: globals.camera,
      projectionMat: globals.perspective
    }
  }
}

class CubeElement extends Element {
  constructor (state) {
    super(state)
    this.plugins = { CubePlugin }
    this.position = state.position || [0, 0, 0]
  }
}

export const main = () => {
  const canvas = document.getElementById('gl-canvas')

  const cubePlugin = new CubePlugin()
  const renderer = new Renderer(canvas, [cubePlugin])
  renderer.setGlobal('camera', setCamera([0, 10, 10]))
  renderer.setGlobal('perspective', setPerspective(canvas))

  const element = new CubeElement({ position: [0, 0, 0] })
  renderer.addElement(element)

  window.renderer = renderer
}
