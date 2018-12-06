/* global test expect */
import { batchAdjustAffected, batchAdjust } from './adjust'

const items = [
  { name: 'layer 0' },
  { name: 'layer 1' },
  { name: 'layer 2' },
  { name: 'layer 3' },
  { name: 'layer 4' },
  { name: 'layer 5' },
  { name: 'layer 6' },
  { name: 'layer 7' }
]

test('can batch adjust items', () => {
  const affectedItems = [
    items[0], items[1], items[2], items[3], items[4], items[5]
  ]
  const groupedItems = [items[1], items[4]]

  expect(batchAdjust(affectedItems, groupedItems, 0)).toEqual(affectedItems)
  expect(batchAdjust(affectedItems, groupedItems, -1)).toEqual([
    items[1], items[4], items[0], items[2], items[3], items[5]
  ])
  expect(batchAdjust(affectedItems, groupedItems, 1)).toEqual([
    items[0], items[2], items[3], items[5], items[1], items[4]
  ])
})

test('can batch adjust items within affected items scope', () => {
  const affectedItems = [
    items[1], items[3], items[3], items[4], items[5], items[6]
  ]
  const groupedItems = [items[1], items[4]]
  expect(batchAdjustAffected(items, affectedItems, groupedItems, -1)).toEqual([
    items[0],
    items[1],
    items[2],
    items[4],
    items[3],
    items[5],
    items[6],
    items[7]
  ])
  expect(batchAdjustAffected(items, affectedItems, groupedItems, 1)).toEqual([
    items[0],
    items[3],
    items[2],
    items[5],
    items[1],
    items[4],
    items[6],
    items[7]
  ])
})
