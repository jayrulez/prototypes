import EventBus from '../events/event-bus.js'
import { unique } from '../utils/misc.js'

const isConnected = (entity, system, length) => {
  let i = 0 | 0
  while (i < length) {
    if ((system.code >> i & 1) & (entity.code >> i & 1)) return true
    i++
  }
  return false
}

export default class World extends EventBus {
  constructor (systems = []) {
    super()

    const components = unique(
      systems.reduce((a, b) => [...a, ...b.components], [])
    )
    this.componentsLength = components.length | 0
    this.componentToCode = {}

    for (let i = 0; i < components.length; i++) {
      this.componentToCode[components[i].name] = 1 << i
    }

    for (let i = 0; i < systems.length; i++) {
      const system = systems[i]
      system.world = this
      let code = 0 | 0
      for (let j = 0; j < system.components.length; j++) {
        const { name } = system.components[j]
        code = code | this.componentToCode[name]
      }
      system.code = code
    }

    this.systems = systems
    this.entities = []
  }

  addEntity (entity) {
    let code = 0 | 0
    for (let i = 0; i < entity.components.length; i++) {
      const { name } = entity.components[i].constructor
      code = code | this.componentToCode[name]
    }
    entity.code = code
    this.entities.push(entity)
  }

  removeEntity (entity) {
    const index = this.entities.indexOf(entity)
    index > -1 && this.entities.splice(index, 1)
  }

  tick () {
    for (let i = 0; i < this.systems.length; i++) {
      this.systems[i].emit('tickStart')
    }

    for (let i = 0; i < this.systems.length; i++) {
      const system = this.systems[i]
      for (let j = 0; j < this.entities.length; j++) {
        const entity = this.entities[j]
        if (isConnected(entity, system, this.componentsLength)) {
          system.emit('update', entity)
        }
      }
    }

    for (let i = 0; i < this.systems.length; i++) {
      this.systems[i].emit('tickEnd')
    }
  }

  start () {
    const tickFrame = () => window.requestAnimationFrame(() => {
      this.tick()
      tickFrame()
    })
    tickFrame()
  }
}
