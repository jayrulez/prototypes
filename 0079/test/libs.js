import {
  getWebGLInstance,
  initShader,
  initFramebufferObject
} from './utils.js'

const defaultUtils = {
  getWebGLInstance,
  initShader,
  initFramebufferObject
}

export class ShadePlugin {
  constructor () {
    this.programSchema = {
      vertexShader: '',
      fragmentShader: '',
      attributes: {},
      uniforms: {}
    }
    this.elementSchema = {}
    this.offscreen = false
  }

  createKey (element) {
    return null
  }

  createBufferProps (element) {
    return null
  }

  createTextureProps (element) {
    return []
  }

  configBuffers (gl, buffers) {

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

export class Beam {
  constructor (canvas, plugins, utils) {
    this.plugins = plugins
    this.globals = {}
    this.elements = []
    this.glUtils = utils || defaultUtils
    this.gl = this.glUtils.getWebGLInstance(canvas)
  }

  addElement (element) {
    element.keys = {}
    this.elements.push(element)
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
