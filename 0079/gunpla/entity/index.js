let id = 0

export default class Entity {
  constructor () {
    this.id = ++id
    this.components = []
    this.componentsMap = {}
  }

  getState (componentClass) {
    const component = this.componentsMap[componentClass.name]
    if (!component) return null
    return component.state
  }

  setState (componentClass, state) {
    const component = this.componentsMap[componentClass.name]
    if (!component) return
    this.componentsMap[componentClass.name].state = state
  }

  useComponents (components) {
    this.components = components
    this.componentsMap = components.reduce((map, component) => ({
      ...map,
      [component.constructor.name]: component
    }), {})
  }
}
