export const fillPixelWrapper = ny => {
  return (ctx, x, y, rgb) => {
    ctx.fillStyle = `rgb(${rgb[0] * 255},${rgb[1] * 255},${rgb[2] * 255})`
    ctx.fillRect(x, ny - y, 1, 1)
  }
}

export class Vec3 extends Float32Array {
  add (b) {
    const a = this
    return new Vec3([a[0] + b[0], a[1] + b[1], a[2] + b[2]])
  }

  scale (b) {
    const a = this
    return new Vec3([a[0] * b, a[1] * b, a[2] * b])
  }
}

export class Ray {
  constructor (a, b) {
    this.a = a
    this.b = b
  }

  get origin () { return this.a }

  get direction () { return this.b }

  pointAt (t) {
    const { a, b } = this
    return a.add(b.scale(t))
  }
}
