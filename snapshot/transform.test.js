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

test('custom match children props', () => {
  const state = {
    id: 0,
    name: 'root',
    elements: [
      { id: 1, name: 'a', elements: [] },
      { id: 2, name: 'b', elements: [] },
      {
        id: 3,
        name: 'c',
        elements: [
          { id: 4, name: 'd', elements: [] },
          { id: 5, name: 'e', elements: [] }
        ]
      }
    ]
  }

  const rule = {
    match: () => true,
    toRecord: node => ({
      chunks: [{ ...node, elements: undefined }],
      children: node.elements
    }),
    fromRecord: ({ chunks, children }) => ({
      ...chunks[0],
      elements: children
    })
  }

  const chunks = {}
  const record = state2Record(state, chunks, [rule], false)
  const resultState = record2State(record, chunks)
  expect(resultState).toEqual(state)
})

test('support node splitting', () => {
  const state = {
    type: 'container',
    children: [
      { type: 'image', left: 100, top: 100, image: 'foo' },
      { type: 'image', left: 200, top: 200, image: 'bar' },
      { type: 'image', left: 300, top: 300, image: 'baz' }
    ]
  }

  const rule = {
    match: ({ type }) => type === 'image',
    toRecord: node => ({
      chunks: [
        { ...node, image: undefined },
        node.image
      ],
      children: null
    }),
    fromRecord: ({ chunks, children }) => ({
      ...chunks[0],
      image: chunks[1]
    })
  }

  const chunks = {}
  const record = state2Record(state, chunks, [rule], false)
  const resultState = record2State(record, chunks)
  expect(resultState).toEqual(state)
  expect(Object.keys(chunks).length).toEqual(1 + 3 * 2) // root + 2 * leaves
})

test('support multi rules', () => {
  const state = {
    type: 'container',
    elements: [
      { type: 'image', left: 100, top: 100, image: 'foo' },
      { type: 'image', left: 200, top: 200, image: 'bar' },
      { type: 'image', left: 300, top: 300, image: 'baz' }
    ]
  }

  const rules = [
    {
      match: ({ type }) => type === 'image',
      toRecord: node => ({
        chunks: [
          { ...node, image: undefined },
          node.image
        ],
        children: null
      }),
      fromRecord: ({ chunks, children }) => ({
        ...chunks[0],
        image: chunks[1]
      })
    },
    {
      match: ({ type }) => type === 'container',
      toRecord: node => ({
        chunks: [{ ...node, elements: undefined }],
        children: node.elements
      }),
      fromRecord: ({ chunks, children }) => ({
        ...chunks[0],
        elements: children
      })
    }
  ]

  const chunks = {}
  const record = state2Record(state, chunks, rules, false)
  const resultState = record2State(record, chunks)
  expect(resultState).toEqual(state)
})

test('support single object', () => {
  const state = {
    type: 'image', left: 100, top: 100, image: 'foo'
  }
  const chunks = {}
  const record = state2Record(state, chunks, [], false)
  const resultState = record2State(record, chunks)
  expect(resultState).toEqual(state)
})

// TODO support incremental chunk update
