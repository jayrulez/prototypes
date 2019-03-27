import Command from '../../libs/command/index.js'

export class InputCommand extends Command {
  constructor (camera, Component) {
    super()
    document.addEventListener('mousedown', () => {
      // TODO add mouse drag control
      console.log(camera.state(Component))
      const state = camera.state(Component)
      state.position[0] += 1
    })
  }
}
