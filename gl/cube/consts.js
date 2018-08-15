export const COLORS = {
  WHITE: [1.0, 1.0, 1.0, 1.0],
  GREEN: [0.0, 1.0, 0.0, 1.0],
  RED: [1.0, 0.0, 0.0, 1.0],
  BLUE: [0.0, 0.0, 1.0, 1.0],
  ORANGE: [1.0, 0.5, 0.0, 1.0],
  YELLOW: [1.0, 1.0, 0.0, 1.0],
  GREY: [0.0, 0.0, 0.0, 0.5]
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
  // Bottom
  [0, -1, -1], [1, -1, 0], [0, -1, 1], [-1, -1, 0],
  // Second layer
  [-1, 0, 1], [1, 0, 1], [1, 0, -1], [-1, 0, -1],
  // Top layer
  [0, 1, 1], [1, 1, 0], [0, 1, -1], [-1, 1, 0]
]

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

export const INIT_BLOCKS = () => {
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
