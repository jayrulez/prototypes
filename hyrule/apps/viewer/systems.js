import System from '../../libs/systems/system.js'
import {
  CameraComponent, PositionComponent, TransformComponent
} from '../../libs/components/index.js'

// On drag we only change camera position
export class DragSystem extends System {
  constructor () {
    super()
    this.components = [CameraComponent]
  }

  update (entity) {
    console.log('drag update', entity)
  }
}

// On spin we change position and transform of an entity
export class SpinSystem extends System {
  constructor () {
    super()
    this.components = [PositionComponent, TransformComponent]
  }

  update (entity) {
    console.log('spin update', entity)
  }
}
