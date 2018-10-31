/* global test expect */
import { state2Record, record2State } from './transform'

test('transform between state and record', () => {
  const state = {
    id: 0,
    name: 'root',
    children: [
      { id: 1, name: 'a', children: [] },
      { id: 2, name: 'b', children: [] },
      {
        id: 3,
        name: 'c',
        children: [
          { id: 4, name: 'd', children: [] },
          { id: 5, name: 'e', children: [] }
        ]
      }
    ]
  }
  const chunks = {}
  const record = state2Record(state, chunks, [], false)
  const resultState = record2State(record, chunks)
  expect(resultState).toEqual(state)
})

test('transform invalid children data', () => {
  const state = {
    id: 0,
    name: 'root',
    children: [
      { id: 1, name: 'a', children: [] },
      { id: 2, name: 'b', children: [] },
      {
        id: 3,
        name: 'c'
        // no children
      }
    ]
  }
  const chunks = {}
  const record = state2Record(state, chunks, [], false)
  const resultState = record2State(record, chunks)
  expect(resultState).toEqual(state)
})
