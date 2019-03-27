import EventBus from '../events/index.js'

export default class System extends EventBus {
  constructor () {
    super()
    this.on('update', entity => this.update(entity))
  }

  update () {}
}
