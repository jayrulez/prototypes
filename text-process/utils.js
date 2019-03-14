const buildPointGetter = (bitmap, height) => (x, y) => bitmap[y * height + x]

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
    for (let j = 0; j < height; j++) {
      bitmap.push(pixels[(i * width + j) * 4] > 0 ? 1 : 0)
    }
  }
  return { bitmap, width, height }
}

/*
// extract outline starting from x and y
const extractOutline = (bitmap, x, y) => {
  const begin = [x, y]
  let curr = begin
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
  return
  const outline = []
  while (true) {
    for (let i = 0; i < seqs.length; i++) {
      outline.push()
    }
  }
}
*/

export const getOutline = (bitmap, width, height) => {
  const get = buildPointGetter(bitmap, height)
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (get(i, j)) {
        console.log(i, j)
        // extractOutline(bitmap, j, i)
        return
      }
    }
  }
}
