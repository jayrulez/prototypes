const isConnected = (entity, system) => {
  return entity.components.some(
    componentInstance => system.components.some(component => (
      componentInstance instanceof component
    ))
  )
}

export default class World {
  constructor (systems = []) {
    this.systems = systems
    this.entities = []
  }

  addEntity (entity) {
    this.entities.push(entity)
  }

  tick () {
    this.systems.forEach(system => system.onTickStart())

    // TODO optimize nested loop
    for (let i = 0; i < this.entities.length; i++) {
      const entity = this.entities[i]
      for (let j = 0; j < this.systems.length; j++) {
        const system = this.systems[j]
        if (isConnected(entity, system)) {
          system.update(entity)
        }
      }
    }

    this.systems.forEach(system => system.onTickEnd())
  }

  start () {
    const tickFrame = () => window.requestAnimationFrame(() => {
      this.tick()
      // runFrame()
    })
    tickFrame()
  }
}
