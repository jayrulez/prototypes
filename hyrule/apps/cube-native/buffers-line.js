import { createRefGrid } from './geometry.js'

export const initBuffers = gl => {
  const positions = createRefGrid(50, 2)
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  return { position: positionBuffer, length: positions.length }
}
