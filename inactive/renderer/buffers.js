export function initBuffers (gl) {
  const positions = [
    320.0, 240.0,
    -320.0, 240.0,
    320.0, -240.0,
    -320.0, -240.0
  ]
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  return {
    position: positionBuffer
  }
}
