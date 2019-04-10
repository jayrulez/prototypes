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
    this.textureSchema = {}
    this.offscreen = false
  }

  createKey ({ state }) {
    return null
  }

  // bufferProps: { keyA, keyB, keyC... }
  createBufferProps ({ state }) {
    return {}
  }

  createUniformPropsByElement ({ state }) {
    return {}
  }

  createUniformPropsByGlobal (globals) {
    return {}
  }
}
