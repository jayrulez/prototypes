import { Cube } from './cube'
import {
  F, B, U, D, R, L,
  EDGE_COORDS, BOTTOM_COLOR, INIT_BLOCKS, COLORS, Y_ROTATE_MAPPING
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
    const base = ['F', 'L', 'B', 'R']
    const baseIndex = base.indexOf(move.replace("'", ''))
    if (baseIndex === -1) return move
    let newNotation = base[(baseIndex + Y_ROTATE_MAPPING[x][y][z]) % 4]
    newNotation += move.includes("'") ? "'" : ''
    return newNotation
  }
  return moves.map(move => moveRelativeTo(coord, move))
}

const faceRelativeTo = ([x, y, z], face) => {
  if (face === U || face === D) return face
  const base = [F, L, B, R]
  const baseIndex = base.indexOf(face)
  return base[(baseIndex + Y_ROTATE_MAPPING[x][y][z]) % 4]
}

const edgeRelativeTo = (vec, dir = 'left') => {
  return {
    [[1, 1, 1]]: [[0, 1, 1], [1, 1, 0]],
    [[1, 1, -1]]: [[1, 1, 0], [0, 1, -1]],
    [[-1, 1, -1]]: [[0, 1, -1], [-1, 1, 0]],
    [[-1, 1, 1]]: [[-1, 1, 0], [0, 1, 1]]
  }[vec][dir === 'left' ? 0 : 1]
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
  const targetColor = topEdge.colors.find(
    c => c !== BOTTOM_COLOR && c !== COLORS.EMPTY
  )
  const toCenter = centerByColor(targetColor)
  const toTopEdge = [toCenter[0], toCenter[1] + 1, toCenter[2]]
  moves.push(...getTopFaceMove(edgeCoord, toTopEdge))
  if (topEdge.colors[U] !== BOTTOM_COLOR) {
    moves.push(...movesRelativeTo(toCenter, ["U'", "R'", 'F', 'R']))
  } else {
    moves.push(...movesRelativeTo(toCenter, ['F', 'F']))
  }
  return moves
}

// TODO Clean up similar moves.
const solveCrossEdge = (cube, [x, y, z]) => {
  const moves = []
  const edge = cube.getBlock([x, y, z])
  if (y === -1) {
    // Bottom layer
    const centerCoord = [x, y + 1, z]
    if (edge.colors[D] === BOTTOM_COLOR) {
      const sideMoves = movesRelativeTo(centerCoord, ['F', 'F'])
      sideMoves.forEach(m => cube.move(m))
      moves.push(...sideMoves)
    } else {
      const sideMoves = movesRelativeTo(centerCoord, ["F'", 'R', 'F', 'U'])
      sideMoves.forEach(m => cube.move(m))
      moves.push(...sideMoves)
    }
    const movesToBottom = topEdgeToBottom(cube, [x, y + 2, z])
    movesToBottom.forEach(m => cube.move(m))
    moves.push(...movesToBottom)
  } else if (y === 0) {
    // Center layer
    const topVec = [x, y + 1, z]
    const leftFace = faceRelativeTo(topVec, F)
    if (edge.colors[leftFace] === BOTTOM_COLOR) {
      const sideMoves = movesRelativeTo(topVec, ['R', 'U', "R'"])
      sideMoves.forEach(m => cube.move(m))
      moves.push(...sideMoves)
    } else {
      const sideMoves = movesRelativeTo(topVec, ["F'", "U'", 'F', 'U'])
      sideMoves.forEach(m => cube.move(m))
      moves.push(...sideMoves)
    }
    const topEdge = edgeRelativeTo(topVec)
    const movesToBottom = topEdgeToBottom(cube, topEdge)
    movesToBottom.forEach(m => cube.move(m))
    moves.push(...movesToBottom)
  } else {
    // Top layer
    const movesToBottom = topEdgeToBottom(cube, [x, y, z])
    movesToBottom.forEach(m => cube.move(m))
    moves.push(...movesToBottom)
  }
  return moves
}

export class Solver {
  constructor (cube) {
    this.cube = cube
  }

  solve () {
    this.solveCross().forEach(moves => this.cube.move(moves))
  }

  solveCross () {
    const baseCube = new Cube(null, this.cube.moves)
    const moves = []
    while (true) {
      const lostEdgeCoords = getLostEdgeCoords(baseCube)
      if (!lostEdgeCoords.length) break
      moves.push(solveCrossEdge(baseCube, lostEdgeCoords[0]))
    }
    return moves
  }

  solveF2L () {

  }
}
