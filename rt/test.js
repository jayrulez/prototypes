import { Vec3, Ray, fillPixelWrapper } from './utils.js'

const canvas = document.getElementById('output')
const ctx = canvas.getContext('2d')
const [nx, ny] = [20, 10]
canvas.width = nx
canvas.height = ny
const fillPixel = fillPixelWrapper(ny)

const bottomLeft = new Vec3([-2, -1, -1])
const horizontal = new Vec3([4, 0, 0])
const vertical = new Vec3([0, 2, 0])
const origin = new Vec3([0, 0, 0])

document.getElementById('go').addEventListener('click', () => {
  for (let j = ny - 1; j >= 0; j--) {
    for (let i = 0; i < nx; i++) {
      const [u, v] = [i / nx, j / ny]
      const dir = bottomLeft.add(horizontal.scale(u)).add(vertical.scale(v))
      const r = new Ray(origin, dir)
      console.log(r)
      const rgb = [i / nx, j / ny, 0.2]
      fillPixel(ctx, i, j, rgb)
    }
  }
})
