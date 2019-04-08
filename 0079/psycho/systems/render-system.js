import System from './system.js'
import {
  CameraComponent,
  GraphicsComponent,
  PositionComponent,
  TransformComponent
} from '../components/index.js'
import Renderer from '../renderer/renderer.js'

const commitElement = (entity, renderer) => {
  const type = entity.getState(GraphicsComponent).type
  const position = entity.getState(PositionComponent)
  const transform = entity.getState(TransformComponent)
  renderer.commitElement({ type, position, transform })
}

const commitCamera = (entity, renderer) => {
  const cameraState = entity.getState(CameraComponent)
  renderer.commitCamera(cameraState)
}

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
    entity.getState(CameraComponent)
      ? commitCamera(entity, this.renderer)
      : commitElement(entity, this.renderer)
  }

  onTickEnd () {
    this.renderer.render()
  }
}
