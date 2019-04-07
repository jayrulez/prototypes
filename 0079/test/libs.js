import {
  getWebGLInstance,
  initProgramProps,
  initBufferProps,
  initFramebufferObject,
  uploadBuffers
} from './utils.js'

export { ShaderTypes, BufferTypes } from './consts.js'

const defaultUtils = {
  getWebGLInstance,
  initProgramProps,
  initBufferProps,
  initFramebufferObject,
  uploadBuffers
}

export class ShadePlugin {
  constructor () {
    this.program = null
    this.programSchema = {
      vertexShader: '',
      fragmentShader: '',
      attributes: {},
      uniforms: {}
    }
    this.buffers = null
    this.bufferSchema = {}
    this.offscreen = false
  }

  createKey (element) {
    return null
  }

  createBufferProps (element) {
    return {}
  }

  createTextureProps (element) {
    return []
  }

  configTextures (gl, textures) {

  }

  configUniforms (gl, global) {

  }

  beforeDraw (gl) {

  }
}

export class Element {
  constructor (state) {
    this.keys = {}
    this.state = state
  }
}

export class Renderer {
  constructor (canvas, plugins, utils = defaultUtils) {
    this.plugins = plugins
    this.globals = {}
    this.elements = []
    this.glUtils = utils
    const {
      getWebGLInstance,
      initProgramProps
    } = this.glUtils
    this.gl = getWebGLInstance(canvas)
    this.plugins.forEach(plugin => {
      plugin.program = initProgramProps(this.gl, plugin.programSchema)
      plugin.buffers = initBufferProps(this.gl, plugin.bufferSchema)
    })
  }

  addElement (element) {
    element.keys = {}
    this.elements.push(element)
    this.plugins.forEach(plugin => {
      const { name } = plugin.constructor
      if (!element.plugins[name]) return

      const { uploadBuffers } = this.glUtils
      const { buffers, bufferSchema } = plugin
      const bufferProps = plugin.createBufferProps(element)
      uploadBuffers(this.gl, bufferProps, buffers, bufferSchema)
    })
  }

  removeElement (element) {
    const index = this.elements.indexOf(element)
    if (index === -1) return
    this.elements.splice(index, 1)
  }

  setGlobal (field, props) {
    this.globals[field] = props
  }

  render () {

  }
}
