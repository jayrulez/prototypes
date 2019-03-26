import System from './system.js'
import {
  InputComponent, GraphicsComponent, PositionComponent, CameraComponent
} from '../components/index.js'

// Animate system cares for everything except graphic materials.
export class AnimateSystem extends System {
  constructor () {
    super()
    this.components = [InputComponent, CameraComponent, PositionComponent]
  }
}

// Render system cares for everything except input.
export class RenderSystem extends System {
  constructor () {
    super()
    this.components = [GraphicsComponent, CameraComponent, PositionComponent]
  }
}
