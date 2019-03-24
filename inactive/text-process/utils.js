// point in polygon
export const pip = (point, vs) => {
  // https://github.com/substack/point-in-polygon
  const [x, y] = point

  let inside = false
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const [xi, yi] = vs[i]
    const [xj, yj] = vs[j]

    const intersect = ((yi > y) !== (yj > y)) &&
          (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }

  return inside
}

export const parseBitmap = canvas => {
  const gl = canvas.getContext('webgl')
  const width = gl.drawingBufferWidth
  const height = gl.drawingBufferHeight
  const pixels = new Uint8Array(width * height * 4)
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  const bitmap = []

  // reverse y order
  for (let i = width - 1; i >= 0; i--) {
    const row = []
    for (let j = 0; j < height; j++) {
      row.push(pixels[(i * width + j) * 4] > 0 ? 1 : 0)
    }
    bitmap.push(row)
  }
  return { bitmap, width, height }
}

const isFilled = (bitmap, x, y) => {
  if (!bitmap[x]) return false
  return !!bitmap[x][y]
}

const findNext = (bitmap, currX, currY) => {
  const seqs = [
    [0, -1], // n
    [1, -1], // ne
    [1, 0], // e
    [1, 1], // se
    [0, 1], // s
    [-1, 1], // sw
    [-1, 0], // w
    [-1, -1] // nw
  ]
  for (let i = 0; i < seqs.length; i++) {
    const [newX, newY] = [currX + seqs[i][0], currY + seqs[i][1]]
    if (isFilled(bitmap, newX, newY)) return [newX, newY]
  }
  return null
}

// extract outline starting from x and y
const extractOutline = (bitmap, x, y, height) => {
  const begin = [x, y]
  let curr = begin
  const outline = [[begin]]
  while (true) {
    const newPoint = findNext(bitmap, curr[0], curr[1])
    if (!newPoint) break

    outline.push(newPoint)
    bitmap[newPoint[0]][newPoint[1]] = 0
    curr = newPoint
  }
  return outline
}

export const getOutline = (bitmap, width, height) => {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isFilled(bitmap, x, y)) {
        const result = extractOutline(bitmap, x, y)
        console.log(result)
        return
      }
    }
  }
}
