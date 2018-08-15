import { initProgram } from './shaders'
import { getBuffer } from './buffers'
import { renderFrame } from './render'
import {
  COLORS, F, B, U, D, R, L, FACE_MAPPING, FACES, BASE_POSITIONS
} from './consts'

const positionsFromCoords = (x, y, z) => {
  const width = 1.9
  const margin = 0.05
  const diff = width + 2 * margin
  const positions = BASE_POSITIONS
    .map((v, i) => v * width / 2 + [x, y, z][i % 3] * diff)
  return positions
}

const colorsFromCoords = (x, y, z) => {
  const colors = [...Array(6)].map(() => COLORS.GREY)
  FACE_MAPPING[x][y][z].forEach(i => { colors[i] = FACES[i] })
  return colors
}

const initBlocks = () => {
  const blocks = []
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        blocks.push({
          positions: positionsFromCoords(x, y, z),
          colors: colorsFromCoords(x, y, z)
        })
      }
    }
  }
  return blocks
}

export class Cube {
  constructor (canvas, notations = []) {
    this.gl = canvas.getContext('webgl')
    this.programInfo = initProgram(this.gl)
    this.gl.useProgram(this.programInfo.program)
    this.blocks = initBlocks()
    notations.forEach(n => this.move(n))
  }

  getBlock ([x, y, z]) {
    return this.blocks[(x + 1) * 9 + (y + 1) * 3 + z + 1]
  }

  move (notation) {
    const mapping = {
      'F': () => this.rotate([0, 0, 1], true),
      'F\'': () => this.rotate([0, 0, 1], false),
      'B': () => this.rotate([0, 0, -1], true),
      'B\'': () => this.rotate([0, 0, -1], false),
      'R': () => this.rotate([1, 0, 0], true),
      'R\'': () => this.rotate([1, 0, 0], false),
      'L': () => this.rotate([-1, 0, 0], true),
      'L\'': () => this.rotate([-1, 0, 0], false),
      'U': () => this.rotate([0, 1, 0], true),
      'U\'': () => this.rotate([0, 1, 0], false),
      'D': () => this.rotate([0, -1, 0], true),
      'D\'': () => this.rotate([0, -1, 0], false)
    }
    mapping[notation]()
    return this
  }

  render (delta = 0) {
    this.buffers = this.blocks.map(
      ({ colors, positions }) => getBuffer(this.gl, colors, positions)
    )
    renderFrame(this.gl, this.programInfo, this.buffers, delta)
  }

  rotate (center, clockwise = true) {
    const axis = center.indexOf(1) + center.indexOf(-1) + 1
    // Fix y direction in right-handed coordinate system.
    clockwise = center[1] !== 0 ? !clockwise : clockwise
    // Fix directions whose faces are opposite to axis.
    clockwise = center[axis] === 1 ? clockwise : !clockwise

    let cs = [[1, 1], [1, -1], [-1, -1], [-1, 1]] // corner coords
    let es = [[0, 1], [1, 0], [0, -1], [-1, 0]] // edge coords
    const prepareCoord = coord => coord.splice(axis, 0, center[axis])
    cs.forEach(prepareCoord); es.forEach(prepareCoord)
    if (!clockwise) { cs = cs.reverse(); es = es.reverse() }

    // Rotate affected edge and corner blocks.
    const rotateBlocks = ([a, b, c, d]) => {
      const set = (a, b) => { for (let i = 0; i < 6; i++) a[i] = b[i] }
      const tmp = []; set(tmp, a); set(a, d); set(d, c); set(c, b); set(b, tmp)
    }
    const colorsAt = coord => this.getBlock(coord).colors
    rotateBlocks(cs.map(colorsAt)); rotateBlocks(es.map(colorsAt))

    // Roatate all block faces with same rotation.
    const swap = [
      [[F, U, B, D], [L, F, R, B], [L, U, R, D]],
      [[F, D, B, U], [F, L, B, R], [D, R, U, L]]
    ][clockwise ? 0 : 1][axis]
    const rotateFaces = coord => {
      const block = colorsAt(coord)
      ;[block[swap[1]], block[swap[2]], block[swap[3]], block[swap[0]]] =
      [block[swap[0]], block[swap[1]], block[swap[2]], block[swap[3]]]
    }
    cs.forEach(rotateFaces); es.forEach(rotateFaces)
    return this
  }
}
