/* global test expect */
import { History } from './history'

const getState = () => ({
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
})

test('can init history', () => {
  const history = new History()
  const state = getState()
  history.pushSync(state)
  expect(history.get()).toEqual(state)
})

test('has correct undo/redo flag', () => {
  const history = new History()
  expect(history.hasUndo).toBeFalsy()
  expect(history.hasRedo).toBeFalsy()

  const state = getState()
  history.pushSync(state)
  expect(history.hasUndo).toBeFalsy()
  expect(history.hasRedo).toBeFalsy()

  history.pushSync(state)
  expect(history.hasUndo).toBeTruthy()
  expect(history.hasRedo).toBeFalsy()

  history.undo()
  expect(history.hasUndo).toBeFalsy()
  expect(history.hasRedo).toBeTruthy()

  history.redo()
  expect(history.hasUndo).toBeTruthy()
  expect(history.hasRedo).toBeFalsy()
})

test('can get state after undo', () => {
  const history = new History()
  const state = getState()
  history.pushSync(state)
  state.name = 'x'
  history.pushSync(state)
  state.name = 'y'
  history.pushSync(state)

  expect(history.get().name).toEqual('y')
  expect(history.undo().get().name).toEqual('x')
  expect(history.undo().get().name).toEqual('root')
})

test('can get state with redundant api call', () => {
  const history = new History()
  const state = getState()
  history.pushSync(state)
  state.name = 'x'
  history.pushSync(state)
  state.name = 'y'
  history.pushSync(state)

  history.undo().undo().undo().undo().undo()
  expect(history.get().name).toEqual('root')
  expect(history.hasUndo).toBeFalsy()

  history.redo().redo().redo().redo().redo()
  expect(history.get().name).toEqual('y')
  expect(history.hasRedo).toBeFalsy()
})
