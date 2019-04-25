import System from '../../systems/system.js'
import {
  PositionComponent,
  TransformComponent
} from '../../components/index.js'
import { create, rotate } from '../../utils/math/matrix.js'

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

    const [x, y] = entity.getState(PositionComponent)
    const delta = getDelta()
    const dX = Math.sin(delta) / 30
    const dY = Math.cos(delta) / 30
    entity.setState(PositionComponent, [x + dX, y + dY, 0])

    const mat = create()
    rotate(mat, mat, delta, [1, 1, 0])
    entity.setState(TransformComponent, mat)
  }
}
