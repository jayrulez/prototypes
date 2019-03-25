import { EPSILON } from './consts.js'

export const cross = (a, b) => ([
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
])

export const subtract = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]

export const normalize = v => {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])

  return len > EPSILON ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0]
}
