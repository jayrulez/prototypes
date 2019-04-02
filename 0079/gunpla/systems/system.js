import EventBus from '../events/event-bus.js'

export default class System extends EventBus {
  constructor () {
    super()
    this.world = null
    this.code = null
    this.components = []
    this.on('update', entity => this.update(entity))
    this.on('tickStart', () => this.onTickStart())
    this.on('tickEnd', () => this.onTickEnd())
  }

  onTickStart () {}

  update () {}

  onTickEnd () {}
}
