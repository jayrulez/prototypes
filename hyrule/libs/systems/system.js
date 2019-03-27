import EventBus from '../events/index.js'

export default class System extends EventBus {
  constructor () {
    super()
    this.world = null
    this.components = []
    this.on('update', entity => this.update(entity))
  }

  update () {}
}
