import {
  getWebGLInstance,
  initProgramInfo,
  initBufferInfo,
  initFramebufferObject,
  uploadSubBuffers,
  uploadFullBuffers,
  resetBeforeDraw,
  draw
} from './utils/gl-utils.js'
import { RendererConfig } from './consts.js'
import {
  push,
  allocateBufferSizes,
  divideUploadKeys,
  getUploadOffset,
  getBufferLengths
} from './utils/misc.js'

const defaultUtils = {
  getWebGLInstance,
  initProgramInfo,
  initBufferInfo,
  initFramebufferObject,
  uploadSubBuffers,
  uploadFullBuffers,
  resetBeforeDraw,
  draw
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
      plugin.bufferSizes = Object
        .keys(plugin.bufferSchema)
        .reduce((map, key) => ({ ...map, [key]: bufferChunkSize }), {})
    })
  }

  addElement (element) {
    element.keys = {} // TODO key-based draw batching

    const { gl, config, elements, plugins, glUtils } = this
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]
      const { name } = plugin.constructor
      if (!element.plugins[name]) return

      const { buffers, bufferSchema, bufferLengthMap, bufferSizes } = plugin
      const bufferProps = plugin.createBufferProps(element)
      const bufferKeys = Object.keys(bufferSchema)
      const { bufferChunkSize } = config
      const uploadOffset = getUploadOffset(
        element, elements, bufferKeys, bufferLengthMap
      )
      const [fullKeys, subKeys] = divideUploadKeys(
        bufferKeys, bufferSchema, bufferProps, bufferChunkSize, uploadOffset
      )
      const bufferLengths = getBufferLengths(
        bufferKeys, bufferProps, bufferSchema
      )
      const { uploadSubBuffers, uploadFullBuffers } = glUtils
      element.bufferMap[name] = bufferProps
      bufferLengthMap.set(element, bufferLengths)
      allocateBufferSizes(
        fullKeys, bufferSchema, bufferSizes, bufferChunkSize, bufferProps
      )
      uploadFullBuffers(
        gl,
        fullKeys,
        name,
        elements,
        bufferProps,
        bufferSizes,
        buffers,
        bufferSchema
      )
      uploadSubBuffers(
        gl, subKeys, uploadOffset, bufferProps, buffers, bufferSchema
      )
    }
    push(elements, element)
  }

  changeElement (element, state) {
    const { gl, elements, plugins, glUtils } = this
    element.state = state
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]
      const { name } = plugin.constructor
      if (!element.plugins[name]) return

      const { buffers, bufferSchema, bufferLengthMap } = plugin
      const bufferProps = plugin.createBufferProps(element)
      const bufferKeys = Object.keys(bufferSchema)
      const uploadOffset = getUploadOffset(
        element, elements, bufferKeys, bufferLengthMap
      )
      const bufferLengths = getBufferLengths(
        bufferKeys, bufferProps, bufferSchema
      )
      const { uploadSubBuffers } = glUtils
      element.bufferMap[name] = bufferProps
      bufferLengthMap.set(element, bufferLengths)
      uploadSubBuffers(
        gl, bufferKeys, uploadOffset, bufferProps, buffers, bufferSchema
      )
    }
  }

  removeElement (element) {
    const index = this.elements.indexOf(element)
    if (index === -1) return
    this.elements.splice(index, 1)

    const { gl, elements, plugins, glUtils } = this
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]
      const { name } = plugin.constructor
      if (!element.plugins[name]) return

      const { buffers, bufferSchema, bufferLengthMap, bufferSizes } = plugin
      const bufferProps = plugin.createBufferProps(element)
      const bufferKeys = Object.keys(bufferSchema)
      const bufferLengths = getBufferLengths(
        bufferKeys, bufferProps, bufferSchema
      )
      const { uploadFullBuffers } = glUtils
      bufferLengthMap.set(element, bufferLengths)
      uploadFullBuffers(
        gl,
        bufferKeys,
        name,
        elements,
        bufferProps,
        bufferSizes,
        buffers,
        bufferSchema
      )
    }
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
