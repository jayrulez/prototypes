import produce from 'immer'

const state = [
  { a: 123 },
  { a: 456 },
  { a: 789 }
]

const newState = produce(state, draft => {
  draft[0].a = 666
})
window.state = state
window.newState = newState
