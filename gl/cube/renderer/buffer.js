export function getBuffer (gl, blocks) {
  const baseIndices = [
    0, 1, 2, 0, 2, 3, // front
    4, 5, 6, 4, 6, 7, // back
    8, 9, 10, 8, 10, 11, // top
    12, 13, 14, 12, 14, 15, // bottom
    16, 17, 18, 16, 18, 19, // right
    20, 21, 22, 20, 22, 23 // left
  ]

  let [positions, faceColors, colors, indices] = [[], [], [], []]
  for (let i = 0; i < blocks.length; i++) {
    positions = [...positions, ...blocks[i].positions]
    faceColors = [...faceColors, ...blocks[i].colors]
    indices = [...indices, ...baseIndices.map(x => x + i * 24)]
  }

  for (let i = 0; i < faceColors.length; i++) {
    const c = faceColors[i]
    // Repeat each color four times for the four vertices of the face.
    colors = colors.concat(c, c, c, c)
  }

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  const colorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)

  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW
  )

  return {
    positions: positionBuffer,
    colors: colorBuffer,
    indices: indexBuffer
  }
}
