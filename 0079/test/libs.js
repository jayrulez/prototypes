import {
  getWebGLInstance,
  initProgramProps,
  initFramebufferObject
} from './utils.js'

const defaultUtils = {
  getWebGLInstance,
  initProgramProps,
  initFramebufferObject
}

export const ShaderTypes = {
  vec4: '4f',
  vec3: '3f',
  vec2: '2f',
  float: '1f',
  int: '1i',
  mat4: '4f',
  mat3: '3f',
  sampler2D: '1i'
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
  constructor (canvas, plugins, utils = defaultUtils) {
    this.plugins = plugins
    this.globals = {}
    this.elements = []
    this.glUtils = utils
    this.gl = this.glUtils.getWebGLInstance(canvas)
    this.plugins.forEach(plugin => {
      plugin.program = initProgramProps(this.gl, plugin.programSchema)
    })
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