const canvas = document.getElementById('output')
const ctx = canvas.getContext('2d')
const nx = canvas.width
const ny = canvas.height

const fillPixel = (ctx, x, y, rgb) => {
  ctx.fillStyle = `rgb(${rgb[0] * 255},${rgb[1] * 255},${rgb[2] * 255})`
  ctx.fillRect(x, ny - y, 1, 1)
}

document.getElementById('go').addEventListener('click', () => {
  for (let j = ny - 1; j >= 0; j--) {
    for (let i = 0; i < nx; i++) {
      const rgb = [i / nx, j / ny, 0.2]
      fillPixel(ctx, i, j, rgb)
    }
  }
})
