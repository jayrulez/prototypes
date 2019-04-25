import World from '../../world/world.js'
import Entity from '../../entity/entity.js'
import {
  CameraComponent,
  GraphicsComponent,
  PositionComponent,
  TransformComponent
} from '../../components/index.js'
import { RenderSystem } from '../../systems/render-system.js'
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

world.start()
window.world = world
