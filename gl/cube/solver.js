import {
  EDGE_COORDS, BOTTOM_COLOR, INIT_BLOCKS
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

const solveCrossEdge = (cube, edgeCoord) => {
  const edgeY = edgeCoord[1]
  if (edgeY === -1) {
    // Bottom layer
  } else if (edgeY === 0) {
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
