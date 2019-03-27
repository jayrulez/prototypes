import System from './system.js'
import {
  CameraComponent,
  GraphicsComponent,
  PositionComponent,
  TransformComponent
} from '../components/index.js'
import Renderer from '../renderer/index.js'

// Render system cares about all components related to the final frame
export class RenderSystem extends System {
  constructor (canvas) {
    super()
    this.renderer = new Renderer(canvas)
    this.components = [
      CameraComponent,
      GraphicsComponent,
      PositionComponent,
      TransformComponent
    ]
  }

  update (entity) {
    const cameraState = entity.state(CameraComponent)
    if (!cameraState) return

    this.renderer.commit(cameraState)
  }

  onTickEnd () {
    this.renderer.render()
  }
}
