export const createRefGrid = (n = 100, size = 10) => {
  const results = []

  for (let x = -n / 2; x <= n / 2; x += 1) {
    results.push(x * size, -n / 2 * size, 0)
    results.push(x * size, n / 2 * size, 0)
  }
  for (let y = -n / 2; y <= n / 2; y += 1) {
    results.push(-n / 2 * size, y * size, 0)
    results.push(n / 2 * size, y * size, 0)
  }

  return new Float32Array(results)
}
