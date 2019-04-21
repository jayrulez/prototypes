export class ShadePlugin {
  constructor () {
    this.programInfo = null
    this.vertexShader = ''
    this.fragmentShader = ''
    this.shaderSchema = {
      attributes: {},
      uniforms: {}
    }
    this.propSchema = {}
    this.elementCodeMaps = [new WeakMap(), {}]
    this.buffers = {}
    this.bufferSizes = {}
    this.indexBufferGroups = []
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
