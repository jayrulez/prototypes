export class ShadePlugin {
  constructor () {
    this.schema = {}
    this.elementProps = {}
    this.programProps = {}
    this.program = {
      vertexShader: '',
      fragmentShader: ''
    }
  }

  keyGetter (element) {
    return null
  }

  bufferGetter (element) {
    return {}
  }
}
