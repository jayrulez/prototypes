import { initProgram } from './shaders'
import { getBuffer } from './buffers'
import { renderFrame } from './render'

const COLORS = {
  WHITE: [1.0, 1.0, 1.0, 1.0],
  GREEN: [0.0, 1.0, 0.0, 1.0],
  RED: [1.0, 0.0, 0.0, 1.0],
  BLUE: [0.0, 0.0, 1.0, 1.0],
  ORANGE: [1.0, 0.5, 0.0, 1.0],
  YELLOW: [1.0, 1.0, 0.0, 1.0]
}

// const fillFace = color => [...Array(9)].map(() => color)
const getColors = () => {
  return [
    COLORS.BLUE, COLORS.GREEN,
    COLORS.YELLOW, COLORS.WHITE,
    COLORS.RED, COLORS.ORANGE
  ]
}

export const getPositions = () => {
  const positons = []
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      for (let k = -1; k <= 1; k++) {
        positons.push(positionsFromCoords(i, j, k))
      }
    }
  }
  return positons
}

const positionsFromCoords = (x, y, z) => {
  const width = 1.9
  const margin = 0.05
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
  const diff = width + 2 * margin
  const positions = basePositions
    .map((v, i) => v * width / 2 + [x, y, z][i % 3] * diff)
  return positions
}

export class Cube {
  constructor (canvas) {
    this.gl = canvas.getContext('webgl')
    this.programInfo = initProgram(this.gl)
    this.gl.useProgram(this.programInfo.program)

    this.positions = getPositions()
    this.colors = getColors()
    this.buffers = this.positions.map(p => getBuffer(this.gl, this.colors, p))
  }

  render () {
    const delta = parseFloat(window.localStorage.delta) || 0
    renderFrame(this.gl, this.programInfo, this.buffers, delta)
  }
}
