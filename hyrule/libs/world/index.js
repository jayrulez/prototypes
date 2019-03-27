import EventBus from '../events/index.js'

const isConnected = (entity, system) => {
  return entity.components.some(
    componentInstance => system.components.some(component => (
      componentInstance instanceof component
    ))
  )
}

export default class World extends EventBus {
  constructor (Systems = []) {
    super()
    this.systems = Systems.map(System => new System(this))
    this.entities = []
  }

  addEntity (entity) {
    this.entities.push(entity)
  }

  tick () {
    this.systems.forEach(system => system.emit('tickStart'))

    // TODO optimize nested loop
    for (let i = 0; i < this.entities.length; i++) {
      const entity = this.entities[i]
      for (let j = 0; j < this.systems.length; j++) {
        const system = this.systems[j]
        if (isConnected(entity, system)) {
          system.emit('update', entity)
        }
      }
    }

    this.systems.forEach(system => system.emit('tickEnd'))
  }

  start () {
    const tickFrame = () => window.requestAnimationFrame(() => {
      this.tick()
      // tickFrame()
    })
    tickFrame()
  }
}
