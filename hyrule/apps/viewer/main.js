import World from '../../libs/world/index.js'
import Entity from '../../libs/entity/index.js'
import {
  InputComponent, GraphicsComponent, PositionComponent, CameraComponent
} from '../../libs/components/index.js'
import { AnimateSystem, RenderSystem } from '../../libs/systems/index.js'

const world = new World([
  new AnimateSystem(),
  new RenderSystem()
])

const cube = new Entity()
const grid = new Entity()
const camera = new Entity()

cube.useComponents([
  new GraphicsComponent({ type: 'Cube' }),
  new PositionComponent([0, 0, 0])
])
grid.useComponents([
  new InputComponent(),
  new GraphicsComponent({ type: 'RefGrid' }),
  new PositionComponent([0, 0, 0])
])
camera.useComponents([new CameraComponent()])

world.addEntity(cube)
world.addEntity(grid)
world.addEntity(camera)
window.world = world
