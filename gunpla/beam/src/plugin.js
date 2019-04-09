export class ShadePlugin {
  constructor () {
    this.programInfo = null
    this.programSchema = {
      vertexShader: '',
      fragmentShader: '',
      attributes: {},
      uniforms: {}
    }
    this.buffers = null
    this.bufferSizes = {}
    this.bufferLengthMap = new WeakMap()
    this.bufferSchema = {}
    this.offscreen = false
  }

  createKey (element) {
    return null
  }

  // bufferProps: { keyA, keyB, keyC... }
  createBufferProps (element) {
    return {}
  }

  createTextureProps (element) {
    return []
  }

  createUniformProps (globals) {
    return {}
  }
}
