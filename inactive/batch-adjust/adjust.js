export const batchAdjust = (items = [], groupedItems = [], offset = 0) => {
  if (offset === 0) return items

  let upperBound, lowerBound
  if (offset > 0) {
    const lastGrouped = groupedItems[groupedItems.length - 1]
    upperBound = Math.min(items.length - 1, items.indexOf(lastGrouped) + offset)
    lowerBound = upperBound - (groupedItems.length - 1)
  } else {
    const firstGrouped = groupedItems[0]
    lowerBound = Math.max(0, items.indexOf(firstGrouped) + offset)
    upperBound = lowerBound + (groupedItems.length - 1)
  }
  const ungroupedItems = items.filter(item => !groupedItems.includes(item))
  const results = []
  let [i, j] = [0, 0]
  while (results.length < items.length) {
    if (lowerBound <= results.length && results.length <= upperBound) {
      results.push(groupedItems[i])
      i++
    } else {
      results.push(ungroupedItems[j])
      j++
    }
  }
  return results
}

export const batchAdjustAffected = (
  items = [], affectedItems = [], groupedItems = [], offset = 0
) => {
  const subItems = items.filter(item => affectedItems.includes(item))
  const affectedIndexes = subItems.map(item => items.indexOf(item))

  const adjustedSubItems = batchAdjust(subItems, groupedItems, offset)
  const results = [...items]
  affectedIndexes.forEach((affectedIndex, subItemIndex) => {
    results[affectedIndex] = adjustedSubItems[subItemIndex]
  })
  return results
}
