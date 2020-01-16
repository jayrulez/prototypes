export const scheduleOnDown = (state, e) => {
  const { offsetX, offsetY } = e

  // on mousedown, position should be reset
  state.x = offsetX
  state.y = offsetY
  state.dragging = false
  state.sizes = []

  const beginStep = 15
  for (let i = 0; i < beginStep; i++) {
    state.sizes.push((i + 1) / beginStep)
  }

  const endStep = 15
  for (let i = 0; i < endStep; i++) {
    state.sizes.push(1 - (i + 1) / endStep)
  }
}

export const scheduleOnMove = (state, e) => {
  // TODO
}

export const scheduleOnUp = (state, e) => {
  // TODO
}
