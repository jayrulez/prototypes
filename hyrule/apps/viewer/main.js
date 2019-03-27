import World from '../../libs/world/index.js'
import Entity from '../../libs/entity/index.js'
import {
  CameraComponent,
  GraphicsComponent,
  PositionComponent,
  TransformComponent
} from '../../libs/components/index.js'
import { RenderSystem } from '../../libs/systems/index.js'
import { DragSystem, SpinSystem } from './systems.js'
import { InputCommand } from './command.js'

const world = new World([
  DragSystem,
  SpinSystem,
  RenderSystem
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
camera.useComponents([
  new CameraComponent({ position: [-10, 10, 30] })
])

world.addEntity(cube)
world.addEntity(grid)
world.addEntity(camera)
void new InputCommand(camera, CameraComponent)

window.world = world
