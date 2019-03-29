import System from '../../gunpla/systems/system.js'
import {
  CameraComponent,
  PositionComponent,
  TransformComponent
} from '../../gunpla/components/index.js'
import { create, rotate } from '../../gunpla/utils/math/matrix.js'

// On drag we only change camera position
export class DragSystem extends System {
  constructor (world) {
    super(world)
    this.components = [CameraComponent]
  }
}

let ts = Date.now()
const getDelta = () => (Date.now() - ts) / 1000

// On spin we change position and transform of an entity
export class SpinSystem extends System {
  constructor (world) {
    super(world)
    this.components = [PositionComponent, TransformComponent]
  }

  update (entity) {
    if (!entity.getState(TransformComponent)) return

    const mat = create()
    rotate(mat, mat, getDelta(), [1, 1, 0])
    entity.setState(TransformComponent, mat)
  }
}
