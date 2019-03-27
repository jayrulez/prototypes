import Component from './component.js'
import { create } from '../math/matrix.js'

export class CameraComponent extends Component {
  constructor (lookAt = {}) {
    super()
    const defaultLookAt = {
      position: [0, 0, 0],
      target: [0, 0, 0],
      up: [0, 1, 0]
    }

    this.state = { ...defaultLookAt, ...lookAt }
  }
}

export class GraphicsComponent extends Component {}

export class PositionComponent extends Component {
  constructor (position) {
    super()
    this.state = position || [0, 0, 0]
  }
}

export class TransformComponent extends Component {
  constructor (mat) {
    super()
    this.state = mat || create()
  }
}
