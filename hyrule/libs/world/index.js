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
  }

  start () {
    const runFrame = () => window.requestAnimationFrame(() => {
      this.tick()
      // runFrame()
    })
    runFrame()
  }
}
