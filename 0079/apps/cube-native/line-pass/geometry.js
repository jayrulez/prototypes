import { GROUND_Z } from '../consts.js'

export const createRefGrid = (n = 100, size = 10) => {
  const results = []

  for (let x = -n / 2; x <= n / 2; x += 1) {
    results.push(x * size, -n / 2 * size, GROUND_Z + 0.01)
    results.push(x * size, n / 2 * size, GROUND_Z + 0.01)
  }
  for (let y = -n / 2; y <= n / 2; y += 1) {
    results.push(-n / 2 * size, y * size, GROUND_Z + 0.01)
    results.push(n / 2 * size, y * size, GROUND_Z + 0.01)
  }

  return new Float32Array(results)
}
