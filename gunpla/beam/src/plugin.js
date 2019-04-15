export class ShadePlugin {
  constructor () {
    this.programInfo = null
    this.programSchema = {
      vertexShader: '',
      fragmentShader: '',
      attributes: {},
      uniforms: {}
    }
    this.propSchema = {}
    this.elementCodeMaps = [new WeakMap(), {}]
    this.buffers = {}
    this.bufferSizes = {}
    this.bufferIndexGroup = []
    this.textureMap = new WeakMap()
    this.offscreen = false
  }

  propsByElement ({ props }) {
    return {}
  }

  propsByGlobals (globals) {
    return {}
  }

  beforeDraw (gl) {

  }
}
