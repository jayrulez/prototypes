import { initProgram } from './shaders'
import { getBuffer } from './buffers'
import { renderFrame } from './render'
import { F, B, U, D, R, L, INIT_BLOCKS } from './consts'

export class Cube {
  constructor (canvas, moves = []) {
    this.blocks = INIT_BLOCKS()
    this.moves = []
    moves.forEach(n => this.move(n))

    if (!canvas) return
    this.gl = canvas.getContext('webgl')
    this.programInfo = initProgram(this.gl)
    this.gl.useProgram(this.programInfo.program)
  }

  getBlock ([x, y, z]) {
    return this.blocks[(x + 1) * 9 + (y + 1) * 3 + z + 1]
  }

  move (m) {
    if (Array.isArray(m)) { m.forEach(m => this.move(m)); return this }

    const mapping = {
      'F': () => this.rotate([0, 0, 1], true),
      "F'": () => this.rotate([0, 0, 1], false),
      'B': () => this.rotate([0, 0, -1], true),
      "B'": () => this.rotate([0, 0, -1], false),
      'R': () => this.rotate([1, 0, 0], true),
      "R'": () => this.rotate([1, 0, 0], false),
      'L': () => this.rotate([-1, 0, 0], true),
      "L'": () => this.rotate([-1, 0, 0], false),
      'U': () => this.rotate([0, 1, 0], true),
      "U'": () => this.rotate([0, 1, 0], false),
      'D': () => this.rotate([0, -1, 0], true),
      "D'": () => this.rotate([0, -1, 0], false)
    }
    mapping[m] && mapping[m](); this.moves.push(m)
    return this
  }

  render (rX = 0, rY = 0) {
    if (!this.gl) throw new Error('Missing WebGL context!')
    this.buffers = this.blocks.map(
      ({ colors, positions }) => getBuffer(this.gl, colors, positions)
    )
    renderFrame(this.gl, this.programInfo, this.buffers, rX, rY)
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

  shuffle (n = 20) {
    const notations = ['F', 'B', 'U', 'D', 'R', 'L']
    return this.move(
      [...Array(n)].map(() => notations[parseInt(Math.random() * 6)])
    )
  }
}
