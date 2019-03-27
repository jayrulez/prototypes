import Component from './component.js'
import { create } from '../math/matrix.js'

export class CameraComponent extends Component {}
export class GraphicsComponent extends Component {}
export class InputComponent extends Component {}

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
