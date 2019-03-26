let id = 0

export default class Entity {
  constructor () {
    this.id = ++id
    this.components = []
  }

  useComponents (components) {
    this.components = components
  }
}
