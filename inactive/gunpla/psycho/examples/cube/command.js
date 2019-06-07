import Command from '../../command/command.js'

const isMobile = window.orientation > -1
const [E_START, E_MOVE, E_END] = isMobile
  ? ['touchstart', 'touchmove', 'touchend']
  : ['mousedown', 'mousemove', 'mouseup']
const clamp = (x, lower, upper) => Math.max(Math.min(x, upper), lower)

let [percentX, percentY] = [0, 0]

const initDrag = (canvas, onDrag) => {
  canvas.addEventListener(E_START, e => {
    e.preventDefault()
    const _e = isMobile ? e.touches[0] : e
    const [baseX, baseY] = [_e.clientX, _e.clientY]
    const [_percentX, _percentY] = [percentX, percentY]

    const onMove = e => {
      const _e = isMobile ? e.touches[0] : e
      const [moveX, moveY] = [_e.clientX, _e.clientY]
      const baseSize = document.body.clientWidth / 2
      percentX = clamp((moveX - baseX) / baseSize + _percentX, -1, 1)
      percentY = clamp((moveY - baseY) / baseSize + _percentY, -1, 1)

      onDrag(percentX, percentY)
    }

    const onEnd = e => {
      document.removeEventListener(E_MOVE, onMove)
      document.removeEventListener(E_END, onEnd)
    }
    document.addEventListener(E_MOVE, onMove)
    document.addEventListener(E_END, onEnd)
  })
}

export class InputCommand extends Command {
  constructor (canvas, camera, Component) {
    super()
    initDrag(canvas, (x, y) => {
      const state = camera.getState(Component)
      state.position = [-x * 30, -y * 30, 30]
    })
  }
}
