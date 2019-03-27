import EventBus from '../events/index.js'

export default class System extends EventBus {
  constructor (world) {
    super()
    this.world = world
    this.on('update', entity => this.update(entity))
  }

  update () {}
}
