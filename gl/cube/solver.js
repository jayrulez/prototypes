import { Cube } from './cube'
import {
  F, B, U, D, R, L,
  W, SE,
  COLORS, COLOR_D, COLOR_L, COLOR_R, PAIRS, EDGE_COORDS, BLOCK_COORDS,
  Y_ROTATE_MAPPING, SLOT_COORDS_MAPPING, EDGE_GRID_MAPPING, CORNER_GRID_MAPPING,
  EDGE_GRIDS, INIT_BLOCKS
} from './consts'

const base = INIT_BLOCKS() // base cube blocks
const baseBlockAt = ([x, y, z]) => base[(x + 1) * 9 + (y + 1) * 3 + z + 1]

const isCorner = ([x, y, z]) => Math.abs(x) + Math.abs(y) + Math.abs(z) === 3

const coordEqual = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2]

const colorsEqual = (a, b) => a.colors.every((c, i) => c === b.colors[i])

const blockHasColor = (block, color) => block.colors.some(c => c === color)

const findCrossCoords = cube => EDGE_COORDS.filter(coord => {
  const block = cube.getBlock(coord)
  return (
    blockHasColor(block, COLOR_D) &&
    !colorsEqual(block, baseBlockAt(coord))
  )
})

const findPairCoords = (cube, pair) => BLOCK_COORDS.filter(coord => {
  const block = cube.getBlock(coord)
  const faces = isCorner(coord) ? [...pair, COLOR_D] : pair
  return faces.every(c => block.colors.includes(c))
})

const inPairSlot = (coord, pair) => {
  const targetSlot = SLOT_COORDS_MAPPING[pair]
  return targetSlot.some(slotCoord => coordEqual(coord, slotCoord))
}

const preparePair = (cube, pair, moves = []) => {
  const [edgeCoord, cornerCoord] = findPairCoords(cube, pair)
  let sideMoves = ['R', 'U', "R'"]
  if (!inPairSlot(edgeCoord, pair) && edgeCoord[1] === 0) {
    const tmpVec = [edgeCoord[0], 1, edgeCoord[2]]
    sideMoves = movesRelativeTo(tmpVec, sideMoves); cube.move(sideMoves)
    return preparePair(cube, pair, [...moves, ...sideMoves])
  }
  if (!inPairSlot(cornerCoord, pair) && cornerCoord[1] === -1) {
    const tmpVec = [cornerCoord[0], 1, cornerCoord[2]]
    sideMoves = movesRelativeTo(tmpVec, sideMoves); cube.move(sideMoves)
    return preparePair(cube, pair, [...moves, ...sideMoves])
  }
  return moves
}

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

const gridByPair = (pair, gridDir) => {
  gridDir = parseInt(gridDir)
  const isEdge = gridDir < 4
  const index = isEdge
    ? (gridDir + PAIRS.indexOf(pair)) % 4
    : ((gridDir - 4 + PAIRS.indexOf(pair)) % 4) + 4
  const mapping = EDGE_GRIDS.includes(gridDir)
    ? EDGE_GRID_MAPPING : CORNER_GRID_MAPPING
  return mapping[index]
}

const rules = [
  {
    match: {
      [W]: { [U]: COLOR_L, [L]: COLOR_R },
      [SE]: { [F]: COLOR_D, [U]: COLOR_L, [R]: COLOR_R }
    },
    moves: ["U'", 'R', 'U', 'U', "R'", 'U', 'U', 'R', "U'", "R'"]
  }
]

const matchRule = (cube, rule, pair) => {
  return Object.keys(rule.match).every(dir => {
    const ruleFaces = Object.keys(rule.match[dir]).map(x => parseInt(x))
    const targetBlock = cube.getBlock(gridByPair(pair, dir))
    const topCornerCoord = gridByPair(pair, SE)
    const mappedFaces = ruleFaces.map(f => faceRelativeTo(topCornerCoord, f))
    const result = ruleFaces.every((face, i) => {
      const ruleColor = rule.match[dir][face]
      const expectedColor = ruleColor === COLOR_D ? COLOR_D : pair[ruleColor]
      return targetBlock.colors[mappedFaces[i]] === expectedColor
    })
    return result
  })
}

const tryRules = (cube, pair) => {
  const preMoves = preparePair(cube, pair)
  const topMoves = [[], ['U'], ['U', 'U'], ["U'"]]
  for (let i = 0; i < topMoves.length; i++) {
    const testCube = new Cube(null, [...cube.moves, ...topMoves[i]])
    for (let j = 0; j < rules.length; j++) {
      if (matchRule(testCube, rules[j], pair)) {
        return [...preMoves, ...topMoves[i], ...rules[j].moves]
      }
    }
  }
  return null
}

const topEdgeToBottom = (cube, edgeCoord) => {
  const moves = []
  const topEdge = cube.getBlock(edgeCoord)
  const targetColor = topEdge.colors.find(
    c => c !== COLOR_D && c !== COLORS.EMPTY
  )
  const toCenter = centerByColor(targetColor)
  const toTopEdge = [toCenter[0], toCenter[1] + 1, toCenter[2]]
  moves.push(...getTopFaceMove(edgeCoord, toTopEdge))
  if (topEdge.colors[U] !== COLOR_D) {
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
    if (edge.colors[D] === COLOR_D) {
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
    if (edge.colors[leftFace] === COLOR_D) {
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
    const clonedCube = new Cube(null, this.cube.moves)
    const moves = []
    while (true) {
      const lostEdgeCoords = findCrossCoords(clonedCube)
      if (!lostEdgeCoords.length) break
      moves.push(solveCrossEdge(clonedCube, lostEdgeCoords[0]))
    }
    return moves
  }

  solveF2L () {
    const clonedCube = new Cube(null, this.cube.moves)
    return tryRules(clonedCube, PAIRS[0])
  }
}
