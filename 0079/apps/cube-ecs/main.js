import World from '../../gunpla/world/index.js'
import Entity from '../../gunpla/entity/index.js'
import {
  CameraComponent,
  GraphicsComponent,
  PositionComponent,
  TransformComponent
} from '../../gunpla/components/index.js'
import { RenderSystem } from '../../gunpla/systems/index.js'
import { SpinSystem } from './systems.js'
import { InputCommand } from './command.js'

const canvas = document.querySelector('#gl-canvas')

const world = new World([
  new SpinSystem(),
  new RenderSystem(canvas)
])

const cube = new Entity()
const grid = new Entity()
const camera = new Entity()

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
  new CameraComponent({ position: [0, 0, 30] })
])

world.addEntity(cube)
world.addEntity(grid)
world.addEntity(camera)
void new InputCommand(canvas, camera, CameraComponent)

window.world = world
