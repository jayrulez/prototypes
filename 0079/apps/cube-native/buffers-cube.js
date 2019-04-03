import { GROUND_Z, PLANE_SIZE } from './consts.js'

export const initBuffers = gl => {
  // Positions
  const cubePositions = [
    // Front
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,
    // Back
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, -1.0, -1.0,
    // Top
    -1.0, 1.0, -1.0,
    -1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, -1.0,
    // Bottom
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, 1.0,
    -1.0, -1.0, 1.0,
    // Right
    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,
    // Left
    -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, 1.0, -1.0
  ]
  const planePositions = [
    -PLANE_SIZE / 2, -PLANE_SIZE / 2, GROUND_Z,
    PLANE_SIZE / 2, -PLANE_SIZE / 2, GROUND_Z,
    PLANE_SIZE / 2, PLANE_SIZE / 2, GROUND_Z,
    -PLANE_SIZE / 2, PLANE_SIZE / 2, GROUND_Z
  ]
  const positions = [...cubePositions, ...planePositions]

  // Colors
  const faceColors = [
    [1.0, 1.0, 1.0, 1.0], // White
    [1.0, 0.0, 0.0, 1.0], // Red
    [0.0, 1.0, 0.0, 1.0], // Green
    [0.0, 0.0, 1.0, 1.0], // Blue
    [1.0, 1.0, 0.0, 1.0], // Yellow
    [1.0, 0.0, 1.0, 1.0] // Purple
  ]
  const planeColors = [[0.7, 0.7, 0.7, 1.0]]
  let colors = []
  for (let i = 0; i < faceColors.length; i++) {
    const c = faceColors[i]
    colors = colors.concat(c, c, c, c)
  }
  for (let i = 0; i < planeColors.length; i++) {
    const c = planeColors[i]
    colors = colors.concat(c, c, c, c)
  }

  // Indices
  const cubeIndices = [
    0, 1, 2, 0, 2, 3, // Front
    4, 5, 6, 4, 6, 7, // Back
    8, 9, 10, 8, 10, 11, // Top
    12, 13, 14, 12, 14, 15, // Bottom
    16, 17, 18, 16, 18, 19, // Right
    20, 21, 22, 20, 22, 23 // Left
  ]
  const planeIndices = [24, 25, 26, 24, 26, 27]
  const indices = [...cubeIndices, ...planeIndices]

  // Normals
  const cubeNormals = [
    [0.0, 0.0, 1.0], // Front
    [0.0, 0.0, -1.0], // Back
    [0.0, 1.0, 0.0], // Top
    [0.0, -1.0, 0.0], // Bottom
    [1.0, 0.0, 0.0], // Right
    [-1.0, 0.0, 0.0] // Left
  ]
  const planeNormals = [[0.0, 0.0, 1.0]]
  let normals = []
  for (let i = 0; i < cubeNormals.length; i++) {
    const n = cubeNormals[i]
    normals = normals.concat(n, n, n, n)
  }
  for (let i = 0; i < planeNormals.length; i++) {
    const n = planeNormals[i]
    normals = normals.concat(n, n, n, n)
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

  const normalBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW)

  return {
    normal: normalBuffer,
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
    length: indices.length
  }
}
