import { createRefGrid } from './geometry.js'
import { GRID_LINE_COUNT, GRID_SIZE } from './consts.js'

export const initBuffers = gl => {
  const positions = createRefGrid(GRID_LINE_COUNT, GRID_SIZE)
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  return { position: positionBuffer, length: positions.length }
}
