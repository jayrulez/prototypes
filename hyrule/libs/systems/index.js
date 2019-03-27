import System from './system.js'
import {
  CameraComponent,
  GraphicsComponent,
  PositionComponent,
  TransformComponent
} from '../components/index.js'

// Render system cares about all components related to the final frame
export class RenderSystem extends System {
  constructor () {
    super()
    this.components = [
      CameraComponent,
      GraphicsComponent,
      PositionComponent,
      TransformComponent
    ]
  }
}
