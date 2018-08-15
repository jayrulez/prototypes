import {
  D, EDGE_COORDS, BOTTOM_COLOR
} from './consts'

const blockHasColor = (block, color) => block.colors.some(c => c === color)

const getLostEdgeCoords = cube => EDGE_COORDS.filter(coord => {
  const block = cube.getBlock(coord)
  return blockHasColor(block, BOTTOM_COLOR) && block.colors[D] !== BOTTOM_COLOR
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
    return solveCrossEdge(lostEdgeCoords[0])
  }
}
