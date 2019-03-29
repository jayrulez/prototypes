import System from '../../gunpla/systems/system.js'
import {
  CameraComponent,
  PositionComponent,
  TransformComponent
} from '../../gunpla/components/index.js'

// On drag we only change camera position
export class DragSystem extends System {
  constructor (world) {
    super(world)
    this.components = [CameraComponent]
  }
}

// On spin we change position and transform of an entity
export class SpinSystem extends System {
  constructor (world) {
    super(world)
    this.components = [PositionComponent, TransformComponent]
  }

  update (entity) {

  }
}
