import {
  D, U, EDGE_COORDS, BOTTOM_COLOR, INIT_BLOCKS, COLORS
} from './consts'

const base = INIT_BLOCKS() // base cube blocks
const baseBlockAt = ([x, y, z]) => base[(x + 1) * 9 + (y + 1) * 3 + z + 1]

const colorsEqual = (a, b) => a.colors.every((c, i) => c === b.colors[i])

const blockHasColor = (block, color) => block.colors.some(c => c === color)

const getLostEdgeCoords = cube => EDGE_COORDS.filter(coord => {
  const block = cube.getBlock(coord)
  return (
    blockHasColor(block, BOTTOM_COLOR) &&
    !colorsEqual(block, baseBlockAt(coord))
  )
})

const getTopFaceMove = ([x0, y0, z0], [x1, y1, z1]) => {
  const offsetMapping = {
    '0': { '1': { '1': 0, '-1': 2 } },
    '-1': { '1': { '0': 3 } },
    '1': { '1': { '0': 1 } }
  }
  const fromOffset = offsetMapping[x0][y0][z0]
  const toOffset = offsetMapping[x1][y1][z1]
  const moveMapping = {
    '-3': ["U'"],
    '-2': ['U', 'U'],
    '-1': ['U'],
    '0': [],
    '1': ["U'"],
    '2': ['U', 'U'],
    '3': ['U']
  }
  return moveMapping[toOffset - fromOffset]
}

const movesRelativeTo = (coord, moves) => {
  const moveRelativeTo = ([x, y, z], move) => {
    const mapping = {
      '0': { '0': { '-1': 2, '1': 0 } },
      '1': { '0': { '0': 3 }, '1': { '1': 0, '-1': 3 } },
      '-1': { '0': { '0': 1 }, '1': { '1': 1, '-1': 2 } }
    }
    const base = ['F', 'L', 'B', 'R']
    const baseIndex = base.indexOf(move.replace('\'', ''))
    const offset = mapping[x][y][z]
    if (baseIndex === -1) return move
    let newNotation = base[(baseIndex + offset) % 4]
    newNotation += move.includes('\'') ? '\'' : ''
    return newNotation
  }
  return moves.map(move => moveRelativeTo(coord, move))
}

const centerByColor = (color) => {
  return {
    [COLORS.BLUE]: [0, 0, 1],
    [COLORS.GREEN]: [0, 0, -1],
    [COLORS.RED]: [1, 0, 0],
    [COLORS.ORANGE]: [-1, 0, 0],
    [COLORS.YELLOW]: [0, 1, 0],
    [COLORS.WHITE]: [0, -1, 0]
  }[color]
}

const topEdgeToBottom = (cube, edgeCoord) => {
  const moves = []
  const topEdge = cube.getBlock(edgeCoord)
  if (topEdge.colors[U] === BOTTOM_COLOR) {
    const targetColor = topEdge.colors.find(
      c => c !== BOTTOM_COLOR && c !== COLORS.GREY
    )
    const toCenter = centerByColor(targetColor)
    const toTopEdge = [toCenter[0], toCenter[1] + 1, toCenter[2]]
    moves.push(...getTopFaceMove(edgeCoord, toTopEdge))
    moves.push(...movesRelativeTo(toCenter, ['F', 'F']))
  }

  return moves
}

const solveCrossEdge = (cube, [x, y, z]) => {
  const moves = []
  if (y === -1) {
    const centerCoord = [x, y + 1, z]
    if (cube.getBlock([x, y, z]).colors[D] === BOTTOM_COLOR) {
      const tmpMoves = movesRelativeTo(centerCoord, ['F', 'F'])
      tmpMoves.forEach(m => cube.move(m))
      moves.push(...tmpMoves)
    } else {
      const tmpMoves = movesRelativeTo(centerCoord, ["F'", 'R', 'F', 'U'])
      tmpMoves.forEach(m => cube.move(m))
      moves.push(...tmpMoves)
    }
    const movesToBottom = topEdgeToBottom(cube, [x, y + 2, z])
    movesToBottom.forEach(m => cube.move(m))
    moves.push(...movesToBottom)
    return moves
  } else if (y === 0) {
    // Center layer
  } else {
    // Top layer
  }
}

export class Solver {
  constructor (cube) {
    this.cube = cube
  }

  solveCross () {
    const lostEdgeCoords = getLostEdgeCoords(this.cube)
    if (!lostEdgeCoords.length) return []
    return solveCrossEdge(this.cube, lostEdgeCoords[0])
  }
}
