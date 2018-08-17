export const COLORS = {
  WHITE: [1.0, 1.0, 1.0, 1.0],
  GREEN: [0.0, 1.0, 0.0, 1.0],
  RED: [1.0, 0.0, 0.0, 1.0],
  BLUE: [0.0, 0.0, 1.0, 1.0],
  ORANGE: [1.0, 0.5, 0.0, 1.0],
  YELLOW: [1.0, 1.0, 0.0, 1.0],
  EMPTY: [0.0, 0.0, 0.0, 0.5]
}

export const BOTTOM_COLOR = COLORS.WHITE

export const [F, B, U, D, R, L] = [0, 1, 2, 3, 4, 5]

export const FACE_MAPPING = {
  '-1': {
    '-1': { '-1': [B, D, L], '0': [D, L], '1': [F, D, L] },
    '0': { '-1': [B, L], '0': [L], '1': [F, L] },
    '1': { '-1': [B, U, L], '0': [U, L], '1': [F, U, L] }
  },
  '0': {
    '-1': { '-1': [B, D], '0': [D], '1': [F, D] },
    '0': { '-1': [B], '0': [], '1': [F] },
    '1': { '-1': [B, U], '0': [U], '1': [F, U] }
  },
  '1': {
    '-1': { '-1': [B, D, R], '0': [D, R], '1': [F, D, R] },
    '0': { '-1': [B, R], '0': [R], '1': [F, R] },
    '1': { '-1': [B, U, R], '0': [U, R], '1': [F, U, R] }
  }
}

export const FACES = [
  COLORS.BLUE, COLORS.GREEN, COLORS.YELLOW,
  COLORS.WHITE, COLORS.RED, COLORS.ORANGE
]

export const EDGE_COORDS = [
  // Bottom layer
  [0, -1, -1], [1, -1, 0], [0, -1, 1], [-1, -1, 0],
  // Second layer
  [-1, 0, 1], [1, 0, 1], [1, 0, -1], [-1, 0, -1],
  // Top layer
  [0, 1, 1], [1, 1, 0], [0, 1, -1], [-1, 1, 0]
]

export const CORNER_COORDS = [
  // Bottom layer
  [1, -1, 1], [1, -1, -1], [-1, -1, -1], [-1, -1, 1],
  // Top layer
  [1, 1, 1], [1, 1, -1], [-1, 1, -1], [-1, 1, 1]
]

export const BLOCK_COORDS = [...EDGE_COORDS, ...CORNER_COORDS]

export const PAIRS = [
  [COLORS.BLUE, COLORS.RED], [COLORS.RED, COLORS.GREEN],
  [COLORS.GREEN, COLORS.ORANGE], [COLORS.ORANGE, COLORS.BLUE]
]

export const SLOT_COORDS_MAPPING = {
  [PAIRS[0]]: [[1, -1, 1], [1, 0, 1]],
  [PAIRS[1]]: [[1, -1, -1], [1, 0, -1]],
  [PAIRS[2]]: [[-1, -1, -1], [-1, 0, -1]],
  [PAIRS[3]]: [[-1, -1, 1], [-1, 0, 1]]
}

export const BASE_POSITIONS = [
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

export const Y_ROTATE_MAPPING = {
  '0': { '0': { '-1': 2, '1': 0 } },
  '1': { '0': { '0': 3 }, '1': { '1': 0, '-1': 3 } },
  '-1': { '0': { '0': 1 }, '1': { '1': 1, '-1': 2 } }
}

export const INIT_BLOCKS = () => {
  const BLOCK_WIDTH = 1.9
  const BLOCK_MARGIN = 0.05
  const positionsFromCoords = (x, y, z) => {
    const diff = BLOCK_WIDTH + 2 * BLOCK_MARGIN
    const positions = BASE_POSITIONS
      .map((v, i) => v * BLOCK_WIDTH / 2 + [x, y, z][i % 3] * diff)
    return positions
  }
  const colorsFromCoords = (x, y, z) => {
    const colors = [...Array(6)].map(() => COLORS.EMPTY)
    FACE_MAPPING[x][y][z].forEach(i => { colors[i] = FACES[i] })
    return colors
  }
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
