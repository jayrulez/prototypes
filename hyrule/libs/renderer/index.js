export default class Renderer {
  constructor (canvas) {
    this.gl = canvas.getContext('webgl')
  }

  commit () {}

  render () {}
}
