import { Snapshot } from './snapshot'

console.clear()

window.state = {
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

const snapshot = new Snapshot()
window.snapshot = snapshot
// snapshot.pushSync(window.state)
