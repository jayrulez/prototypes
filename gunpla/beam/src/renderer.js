import {
  getWebGLInstance,
  initProgramInfo,
  initBufferInfo,
  initFramebufferObject,
  uploadSubBuffers,
  uploadFullBuffers,
  resetBeforeDraw,
  draw
} from './gl-utils.js'
import { RendererConfig, BufferTypes } from './consts.js'

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
    element.keys = {}

    this.plugins.forEach(plugin => {
      const { name } = plugin.constructor
      if (!element.plugins[name]) return

      const { buffers, bufferSchema, bufferLengthMap, bufferSizes } = plugin
      // bufferProps: { keyA, keyB, keyC... }
      const bufferProps = plugin.createBufferProps(element)
      // bufferKeys: [keyA, keyB, keyC...]
      const bufferKeys = Object.keys(bufferSchema)
      const indexKey = bufferKeys.find(key => bufferSchema[key].index)
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

      for (let i = 0; i < this.elements.length; i++) {
        const elementBufferLengths = bufferLengthMap.get(this.elements[i])
        if (elementBufferLengths) {
          uploadOffset.index += elementBufferLengths.index
        }
        for (let j = 0; j < bufferKeys.length; j++) {
          const key = bufferKeys[j]
          uploadOffset.keys[key] += elementBufferLengths.keys[key]
        }
      }

      const { gl, config, elements, glUtils } = this
      const { bufferChunkSize } = config
      const fullKeys = []
      const subKeys = []
      for (let i = 0; i < bufferKeys.length; i++) {
        const key = bufferKeys[i]
        const size = bufferSchema[key] === BufferTypes.float ? 4 : 2
        const need = (uploadOffset.keys[key] + bufferProps[key].length) * size
        if (need < bufferChunkSize) subKeys.push(key)
        else {
          bufferSizes[key] += Math.max(
            bufferChunkSize, bufferProps[key].length * size
          )
          fullKeys.push(key)
        }
      }

      const { uploadSubBuffers, uploadFullBuffers } = glUtils
      element.bufferMap[name] = bufferProps
      bufferLengthMap.set(element, bufferLengths)
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
