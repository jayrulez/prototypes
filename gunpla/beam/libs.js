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

import { RendererConfig } from './consts.js'
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
    this.bufferLengthMap = new WeakMap()
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

  createUniformProps (globals) {
    return {}
  }
}

export class Element {
  constructor (state) {
    this.keys = {}
    this.bufferProps = null
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
  constructor (
    canvas, plugins, config = RendererConfig, utils = defaultUtils
  ) {
    this.plugins = plugins
    this.globals = {}
    this.config = config
    this.elements = []
    this.glUtils = utils
    const {
      getWebGLInstance,
      initProgramInfo,
      initBufferInfo
    } = this.glUtils
    const { bufferChunkSize } = this.config
    this.gl = getWebGLInstance(canvas)
    this.plugins.forEach(plugin => {
      plugin.programInfo = initProgramInfo(this.gl, plugin.programSchema)
      plugin.buffers = initBufferInfo(
        this.gl, plugin.bufferSchema, bufferChunkSize
      )
    })
  }

  addElement (element) {
    element.keys = {}

    this.plugins.forEach(plugin => {
      const { name } = plugin.constructor
      if (!element.plugins[name]) return

      const { buffers, bufferSchema, bufferLengthMap } = plugin
      // bufferProps: { keyA, keyB, keyC... }
      const bufferProps = plugin.createBufferProps(element)
      // bufferKeys: [keyA, keyB, keyC...]
      const bufferKeys = Object.keys(bufferSchema)
      const indexKey = Object
        .keys(bufferSchema)
        .find(key => bufferSchema[key].index)
      // bufferLengths: { keys: { keyA, keyB, keyC... }, index }
      const bufferLengths = {
        keys: bufferKeys.reduce(
          (map, key) => ({ ...map, [key]: bufferProps[key].length }), {}
        ),
        index: Math.max(...bufferProps[indexKey]) + 1
      }
      // uploadOffset: { keys: { keyA, keyB, keyC... }, index }
      const uploadOffset = {
        keys: bufferKeys.reduce((map, key) => ({ ...map, [key]: 0 }), {}),
        index: 0
      }

      let elementBufferLengths
      for (let i = 0; i < this.elements.length; i++) {
        elementBufferLengths = bufferLengthMap.get(this.elements[i])
        for (let j = 0; j < bufferKeys.length; j++) {
          const key = bufferKeys[j]
          uploadOffset.keys[key] += elementBufferLengths.keys[key]
        }
      }
      // Only use last buffer lengths to update index count
      if (elementBufferLengths) {
        uploadOffset.index += elementBufferLengths.index
      }

      const { uploadBuffers } = this.glUtils
      bufferLengthMap.set(element, bufferLengths)
      uploadBuffers(this.gl, uploadOffset, bufferProps, buffers, bufferSchema)
    })

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
    const { gl, glUtils, plugins, globals, elements } = this
    const { resetBeforeDraw, draw } = glUtils
    resetBeforeDraw(gl)
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]
      const { programInfo, buffers, bufferSchema, bufferLengthMap } = plugin
      const indexKey = Object
        .keys(bufferSchema)
        .find(key => bufferSchema[key].index)

      let totalLength = 0
      for (let i = 0; i < elements.length; i++) {
        const bufferLengths = bufferLengthMap.get(elements[i])
        if (!bufferLengths) continue
        totalLength += bufferLengths.keys[indexKey]
      }
      const uniformProps = plugin.createUniformProps(globals)

      draw(gl, programInfo, buffers, bufferSchema, totalLength, uniformProps)
    }
  }
}
