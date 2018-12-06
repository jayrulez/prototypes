export const batchAdjust = (items = [], groupedItems = [], diff = 0) => {
  if (diff === 0) return items

  let upperBound, lowerBound
  if (diff > 0) {
    const lastGroupedItem = groupedItems[groupedItems.length - 1]
    upperBound = Math.min(
      items.length - 1, items.indexOf(lastGroupedItem) + diff
    )
    lowerBound = upperBound - groupedItems.length
  } else if (diff < 0) {
    const firstGroupedItem = groupedItems[0]
    lowerBound = Math.max(
      0, items.indexOf(firstGroupedItem) - diff
    )
    upperBound = lowerBound + groupedItems.length
  }
  const ungroupedItems = items.filter(item => groupedItems.includes(item))
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

export const adjustAffectedItems = (
  items = [], affectedItems = [], groupedItems = [], diff = 0
) => {
  const subItems = items.filter(item => affectedItems.includes(item))
  const affectedIndexes = affectedItems.map(item => items.indexOf(item))

  const adjustedSubItems = batchAdjust(subItems, groupedItems, diff)
  const results = items
  affectedIndexes.forEach((affectedIndex, subItemIndex) => {
    results[affectedIndex] = adjustedSubItems[subItemIndex]
  })
  return results
}
