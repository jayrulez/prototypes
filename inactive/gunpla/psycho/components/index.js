import Component from './component.js'
import { create } from '../utils/math/matrix.js'

// world.entities[x].components[x].state.position
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

export class GraphicsComponent extends Component {
  constructor (graphicsData) {
    super()
    this.state = graphicsData || { type: 'Cube' }
  }
}

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
