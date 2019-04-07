import { create, lookAt, perspective } from './matrix.js'
import {
  getWebGLInstance,
  initProgramInfo,
  initBufferInfo,
  initFramebufferObject,
  uploadBuffers,
  resetBeforeDraw,
  draw
} from './utils.js'

export { ShaderTypes, BufferTypes } from './consts.js'

const defaultUtils = {
  getWebGLInstance,
  initProgramInfo,
  initBufferInfo,
  initFramebufferObject,
  uploadBuffers,
  resetBeforeDraw,
  draw
}

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
    this.bufferLength = 0
    this.bufferSchema = {}
    this.offscreen = false
  }

  createKey (element) {
    return null
  }

  createBufferProps (element) {
    return { keys: {}, length: 0 }
  }

  createTextureProps (element) {
    return []
  }

  createUniformProps (globals) {
    return {}
  }
}

export class Element {
  constructor (state) {
    this.keys = {}
    this.state = state
  }
}

export const setPerspective = (canvas) => {
  const fov = Math.PI / 6
  const aspect = canvas.clientWidth / canvas.clientHeight
  const projectionMat = create()
  perspective(projectionMat, fov, aspect, 0.1, 100.0)
  return projectionMat
}

export const setCamera = (eye, center, up) => {
  const viewMat = create()
  lookAt(viewMat, eye || [0, 0, 0], center || [0, 0, 0], up || [0, 1, 0])
  return viewMat
}

export class Renderer {
  constructor (canvas, plugins, utils = defaultUtils) {
    this.plugins = plugins
    this.globals = {}
    this.elements = []
    this.glUtils = utils
    const {
      getWebGLInstance,
      initProgramInfo,
      initBufferInfo
    } = this.glUtils
    this.gl = getWebGLInstance(canvas)
    this.plugins.forEach(plugin => {
      plugin.programInfo = initProgramInfo(this.gl, plugin.programSchema)
      plugin.buffers = initBufferInfo(this.gl, plugin.bufferSchema)
    })
  }

  addElement (element) {
    element.keys = {}
    this.elements.push(element)
    this.plugins.forEach(plugin => {
      const { name } = plugin.constructor
      if (!element.plugins[name]) return

      const { buffers, bufferSchema } = plugin
      const bufferProps = plugin.createBufferProps(element)
      plugin.bufferLength += bufferProps.length
      const { uploadBuffers } = this.glUtils
      uploadBuffers(this.gl, bufferProps.keys, buffers, bufferSchema)
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
    const { gl, glUtils, plugins, globals } = this
    const { resetBeforeDraw, draw } = glUtils
    resetBeforeDraw(gl)
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]
      const { programInfo, buffers, bufferSchema, bufferLength } = plugin
      const uniformProps = plugin.createUniformProps(globals)
      draw(gl, programInfo, buffers, bufferSchema, bufferLength, uniformProps)
    }
  }
}
