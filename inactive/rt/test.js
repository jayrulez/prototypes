import { Vec3, Ray, fillPixelWrapper } from './utils.js'

const canvas = document.getElementById('output')
const ctx = canvas.getContext('2d')
const [nx, ny] = [200, 100].map(x => x / 1)
canvas.width = nx
canvas.height = ny
const fillPixel = fillPixelWrapper(ny)

const bottomLeft = new Vec3(-2, -1, -1)
const horizontal = new Vec3(4, 0, 0)
const vertical = new Vec3(0, 2, 0)
const origin = new Vec3(0, 0, 0)

const hitSphere = (center, radius, ray) => {
  const { x, y, z } = ray.origin
  const oc = new Vec3(x, y, z).substract(center)
  const a = Vec3.dot(ray.direction, ray.direction)
  const b = 2 * Vec3.dot(oc, ray.direction)
  const c = Vec3.dot(oc, oc) - radius * radius
  const discriminant = b * b - 4 * a * c

  return discriminant > 0
}

const color = ray => {
  if (hitSphere(new Vec3(0, 0, -1), 0.5, ray)) return new Vec3(1, 0, 0)

  const unit = ray.direction.toUnit()
  const t = 0.5 * (unit.y + 1)
  return new Vec3(1, 1, 1).scale(1 - t).add(new Vec3(0.5, 0.7, 1).scale(t))
}

document.getElementById('go').addEventListener('click', () => {
  console.time(`${nx}x${ny}`)

  for (let j = ny - 1; j >= 0; j--) {
    for (let i = 0; i < nx; i++) {
      const [u, v] = [i / nx, j / ny]
      const dir = bottomLeft.add(horizontal.scale(u)).add(vertical.scale(v))
      const r = new Ray(origin, dir)
      const rgb = color(r)
      fillPixel(ctx, i, j, rgb)
    }
  }

  console.timeEnd(`${nx}x${ny}`)
})
