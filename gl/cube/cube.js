import { initProgram } from './shaders'
import { getBuffer } from './buffers'
import { renderFrame } from './render'

const COLORS = {
  WHITE: [1.0, 1.0, 1.0, 1.0],
  GREEN: [0.0, 1.0, 0.0, 1.0],
  RED: [1.0, 0.0, 0.0, 1.0],
  BLUE: [0.0, 0.0, 1.0, 1.0],
  ORANGE: [1.0, 0.5, 0.0, 1.0],
  YELLOW: [1.0, 1.0, 0.0, 1.0],
  GREY: [0.0, 0.0, 0.0, 0.5]
}

const [F, B, U, D, R, L] = [0, 1, 2, 3, 4, 5]
const [NW, N, NE, W, C, E, SW, S, SE] = [0, 1, 2, 3, 4, 5, 6, 7, 8]

const FACE_MAPPING = {
  '-1': {
    '-1': {
      '-1': [[B, SE], [D, SW], [L, SW]],
      '0': [[D, W], [L, S]],
      '1': [[F, SW], [D, NW], [L, SE]]
    },
    '0': {
      '-1': [[B, E], [L, W]],
      '0': [[L, C]],
      '1': [[F, W], [L, E]]
    },
    '1': {
      '-1': [[B, NE], [U, NW], [L, NW]],
      '0': [[U, W], [L, N]],
      '1': [[F, NW], [U, SW], [L, NE]]
    }
  },
  '0': {
    '-1': {
      '-1': [[B, S], [D, W]],
      '0': [[D, C]],
      '1': [[F, S], [D, N]]
    },
    '0': {
      '-1': [[B, C]],
      '0': [],
      '1': [[F, C]]
    },
    '1': {
      '-1': [[B, N], [U, N]],
      '0': [[U, C]],
      '1': [[F, N], [U, S]]
    }
  },
  '1': {
    '-1': {
      '-1': [[B, SW], [D, SE], [R, SE]],
      '0': [[D, E], [R, S]],
      '1': [[F, SE], [D, NE], [R, SW]]
    },
    '0': {
      '-1': [[B, W], [R, E]],
      '0': [[R, C]],
      '1': [[F, E], [R, W]]
    },
    '1': {
      '-1': [[B, NW], [U, NE], [R, NE]],
      '0': [[U, E], [R, N]],
      '1': [[F, NE], [U, SE], [R, NW]]
    }
  }
}

const fillFace = (color, i) => [...Array(i)].map(() => color)

const positionFromCoords = (x, y, z) => {
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

    this.initBlocks()
  }

  getBlockColors (x, y, z) {
    const colors = fillFace(COLORS.GREY, 6)
    FACE_MAPPING[x][y][z].forEach(([face, grid]) => {
      colors[face] = this.faces[face][grid]
    })
    return colors
  }

  getBlockPositions (x, y, z) {
    // TODO apply transform for specific block positions.
    return positionFromCoords(x, y, z)
  }

  initBlocks () {
    this.faces = [
      fillFace(COLORS.BLUE, 9),
      fillFace(COLORS.GREEN, 9),
      fillFace(COLORS.YELLOW, 9),
      fillFace(COLORS.WHITE, 9),
      fillFace(COLORS.RED, 9),
      fillFace(COLORS.ORANGE, 9)
    ]

    this.blocks = []
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          this.blocks.push({
            positions: this.getBlockPositions(x, y, z),
            colors: this.getBlockColors(x, y, z)
          })
        }
      }
    }
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
    const rotateBlocks = (a, b, c, d) => {
      const set = (a, b) => { for (let i = 0; i < 6; i++) a[i] = [...b[i]] }
      let tmp = []; set(tmp, a); set(a, d); set(d, c); set(c, b); set(b, tmp)
    }
    const colorsAt = ([x, y, z]) => (
      this.blocks[(x + 1) * 9 + (y + 1) * 3 + z + 1].colors
    )
    let [a, b, c, d, e, f, g, h] = [
      colorsAt(cs[0]), colorsAt(cs[1]), colorsAt(cs[2]), colorsAt(cs[3]),
      colorsAt(es[0]), colorsAt(es[1]), colorsAt(es[2]), colorsAt(es[3])
    ]
    rotateBlocks(a, b, c, d); rotateBlocks(e, f, g, h)

    // Roatate all block faces with same rotation.
    let swap = [
      [[F, U, B, D], [L, F, R, B], [L, U, R, D]],
      [[F, D, B, U], [F, L, B, R], [D, R, U, L]]
    ][clockwise ? 0 : 1][axis]
    const rotateFaces = (i) => {
      const block = colorsAt(i)
      ;[block[swap[1]], block[swap[2]], block[swap[3]], block[swap[0]]] =
      [block[swap[0]], block[swap[1]], block[swap[2]], block[swap[3]]]
    }
    cs.forEach(rotateFaces); es.forEach(rotateFaces)
  }
}
