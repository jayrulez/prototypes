import World from '../../libs/world/index.js'
import Entity from '../../libs/entity/index.js'
import {
  CameraComponent,
  GraphicsComponent,
  InputComponent,
  PositionComponent,
  TransformComponent
} from '../../libs/components/index.js'
import { RenderSystem } from '../../libs/systems/index.js'
import { DragSystem, SpinSystem } from './systems.js'

const world = new World([
  new DragSystem(),
  new SpinSystem(),
  new RenderSystem()
])

const [cube, grid, camera] = [new Entity(), new Entity(), new Entity()]

cube.useComponents([
  new TransformComponent(),
  new GraphicsComponent({ type: 'Cube' }),
  new PositionComponent()
])
grid.useComponents([
  new GraphicsComponent({ type: 'RefGrid' }),
  new PositionComponent()
])
camera.useComponents([new InputComponent(), new CameraComponent()])

world.addEntity(cube)
world.addEntity(grid)
world.addEntity(camera)
window.world = world
