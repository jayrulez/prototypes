export default class World {
  constructor (systems = []) {
    this.systems = systems
    this.entities = []
  }

  addEntity (entity) {
    // TODO build look up table
    this.entities.push(entity)
  }
}
