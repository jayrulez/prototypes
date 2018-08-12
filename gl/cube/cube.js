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

const [FRONT, BACK, TOP, BOTTOM, RIGHT, LEFT] = [0, 1, 2, 3, 4, 5]
const [NW, N, NE, W, C, E, SW, S, SE] = [0, 1, 2, 3, 4, 5, 6, 7, 8]

const FACE_MAPPING = {
  '-1': {
    '-1': {
      '-1': [[BACK, SE], [BOTTOM, SW], [LEFT, SW]],
      '0': [[BOTTOM, W], [LEFT, S]],
      '1': [[FRONT, SW], [BOTTOM, NW], [LEFT, SE]]
    },
    '0': {
      '-1': [[BACK, E], [LEFT, W]],
      '0': [[LEFT, C]],
      '1': [[FRONT, W], [LEFT, E]]
    },
    '1': {
      '-1': [[BACK, NE], [TOP, NW], [LEFT, NW]],
      '0': [[TOP, W], [LEFT, N]],
      '1': [[FRONT, NW], [TOP, SW], [LEFT, NE]]
    }
  },
  '0': {
    '-1': {
      '-1': [[BACK, S], [BOTTOM, W]],
      '0': [[BOTTOM, C]],
      '1': [[FRONT, S], [BOTTOM, N]]
    },
    '0': {
      '-1': [[BACK, C]],
      '0': [],
      '1': [[FRONT, C]]
    },
    '1': {
      '-1': [[BACK, N], [TOP, N]],
      '0': [[TOP, C]],
      '1': [[FRONT, N], [TOP, S]]
    }
  },
  '1': {
    '-1': {
      '-1': [[BACK, SW], [BOTTOM, SE], [RIGHT, SE]],
      '0': [[BOTTOM, E], [RIGHT, S]],
      '1': [[FRONT, SE], [BOTTOM, NE], [RIGHT, SW]]
    },
    '0': {
      '-1': [[BACK, W], [RIGHT, E]],
      '0': [[RIGHT, C]],
      '1': [[FRONT, E], [RIGHT, W]]
    },
    '1': {
      '-1': [[BACK, NW], [TOP, NE], [RIGHT, NE]],
      '0': [[TOP, E], [RIGHT, N]],
      '1': [[FRONT, NE], [TOP, SE], [RIGHT, NW]]
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
      'B\'': () => this.rotate([0, 0, -1], true),
      'R': () => this.rotate([1, 0, 0], true),
      'L\'': () => this.rotate([-1, 0, 0], true)
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
    const prepareIndex = (i) => {
      i.splice(axis, 0, center[axis])

      if (clockwise) return
      const [a, b] = [(axis + 1) % 3, (axis + 2) % 3]
      ;[i[a], i[b]] = [i[b], i[a]]
    }
    const colorsAt = (i) => {
      return this.blocks[(i[0] + 1) * 9 + (i[1] + 1) * 3 + (i[2] + 1)].colors
    }
    const cs = [[1, 1], [1, -1], [-1, -1], [-1, 1]] // corner indexes
    const es = [[0, 1], [1, 0], [0, -1], [-1, 0]] // edge indexes
    cs.forEach(prepareIndex)
    es.forEach(prepareIndex)

    const shiftColor = (a, b, c, d) => {
      const set = (a, b) => { for (let i = 0; i < 6; i++) a[i] = [...b[i]] }
      let tmp = []
      if (clockwise) {
        set(tmp, a); set(a, d); set(d, c); set(c, b); set(b, tmp)
      } else {
        set(tmp, a); set(a, b); set(b, c); set(c, d); set(d, tmp)
      }
    }

    let [a, b, c, d, e, f, g, h] = [
      colorsAt(cs[0]), colorsAt(cs[1]), colorsAt(cs[2]), colorsAt(cs[3]),
      colorsAt(es[0]), colorsAt(es[1]), colorsAt(es[2]), colorsAt(es[3])
    ]

    shiftColor(a, b, c, d); shiftColor(e, f, g, h)

    const swap = [
      [FRONT, TOP, BACK, BOTTOM],
      [LEFT, BACK, RIGHT, FRONT],
      [LEFT, TOP, RIGHT, BOTTOM]
    ][axis]
    const swapBlockFaces = (i) => {
      const b = colorsAt(i)
      if (clockwise) {
        [b[swap[1]], b[swap[2]], b[swap[3]], b[swap[0]]] =
        [b[swap[0]], b[swap[1]], b[swap[2]], b[swap[3]]]
      } else {
        [b[swap[0]], b[swap[1]], b[swap[2]], b[swap[3]]] =
        [b[swap[1]], b[swap[2]], b[swap[3]], b[swap[0]]]
      }
    }
    cs.forEach(swapBlockFaces)
    es.forEach(swapBlockFaces)
  }
}
