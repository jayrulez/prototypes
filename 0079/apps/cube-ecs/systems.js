import System from '../../gunpla/systems/system.js'
import {
  PositionComponent,
  TransformComponent
} from '../../gunpla/components/index.js'
import { create, rotate } from '../../gunpla/utils/math/matrix.js'

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

    const delta = getDelta()
    const posX = Math.sin(delta) * 2
    const posY = Math.cos(delta) * 2
    entity.setState(PositionComponent, [posX, posY, 0])

    const mat = create()
    rotate(mat, mat, delta, [1, 1, 0])
    entity.setState(TransformComponent, mat)
  }
}
