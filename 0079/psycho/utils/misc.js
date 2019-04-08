export const unique = arr => {
  const map = {}
  const results = []
  for (let i = 0; i < arr.length; i++) {
    if (!map[arr[i]]) {
      map[arr[i]] = true
      results.push(arr[i])
    }
  }
  return results
}
