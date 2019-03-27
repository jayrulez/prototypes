export default class Renderer {
  constructor (canvas) {
    this.gl = canvas.getContext('webgl')
    this.renderObjects = []
  }

  commit (renderObject) {
    this.renderObjects.push(renderObject)
  }

  render () {
    console.log(this.renderObjects)
    this.renderObjects = []
  }
}
