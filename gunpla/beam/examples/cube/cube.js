import {
  Element,
  ShadePlugin,
  ShaderTypes,
  PropTypes
} from '../../src/index.js'

const push = (arr, x) => { arr[arr.length] = x }

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

const index = [
  0, 1, 2, 0, 2, 3, // Front
  4, 5, 6, 4, 6, 7, // Back
  8, 9, 10, 8, 10, 11, // Top
  12, 13, 14, 12, 14, 15, // Bottom
  16, 17, 18, 16, 18, 19, // Right
  20, 21, 22, 20, 22, 23 // Left
]

export class CubePlugin extends ShadePlugin {
  constructor () {
    super()

    const { vec3, vec4, mat4 } = ShaderTypes
    this.vertexShader = vertexShader
    this.fragmentShader = fragmentShader
    this.shaderSchema.attributes = {
      pos: vec3,
      color: vec4
    }
    this.shaderSchema.uniforms = {
      viewMat: mat4,
      projectionMat: mat4
    }

    const { buffer } = PropTypes
    this.propSchema = {
      pos: { type: buffer, n: 3 },
      color: { type: buffer, n: 4 },
      index: { type: buffer, index: true }
    }
  }

  propsByElement ({ props }) {
    const p = props.position
    const pos = []
    for (let i = 0; i < basePositions.length; i += 3) {
      push(pos, basePositions[i] + p[0])
      push(pos, basePositions[i + 1] + p[1])
      push(pos, basePositions[i + 2] + p[2])
    }
    let color = []
    for (let i = 0; i < faceColors.length; i++) {
      const c = props.color ? props.color : faceColors[i]
      color = color.concat(c, c, c, c)
    }
    return { pos, color, index }
  }

  propsByGlobals (globals) {
    return {
      viewMat: globals.camera,
      projectionMat: globals.perspective
    }
  }
}

export class CubeElement extends Element {
  constructor (props) {
    super(props)
    this.plugins = { CubePlugin }
  }
}
