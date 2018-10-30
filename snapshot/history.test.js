/* global test expect */
import { History } from './history'

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

test('can init history', () => {
  const history = new History()
  history.pushSync(state)
  expect(history.get()).toEqual(state)
})
