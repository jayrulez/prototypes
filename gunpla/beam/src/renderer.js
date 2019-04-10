import {
  getWebGLInstance,
  initProgramInfo,
  initBufferInfo,
  initFramebufferObject,
  uploadSubBuffers,
  uploadFullBuffers,
  uploadTexture,
  resetBeforeDraw,
  draw
} from './utils/gl-utils.js'
import { RendererConfig, PropTypes } from './consts.js'
import {
  push,
  getCharFromMaps,
  getBufferKeys,
  setCharToMaps,
  generateChar,
  allocateBufferSizes,
  divideUploadKeys,
  alignBufferProps
} from './utils/misc.js'

const defaultUtils = {
  getWebGLInstance,
  initProgramInfo,
  initBufferInfo,
  initFramebufferObject,
  uploadSubBuffers,
  uploadFullBuffers,
  uploadTexture,
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
      const { programSchema, propSchema } = plugin
      plugin.programInfo = initProgramInfo(this.gl, programSchema)
      plugin.buffers = initBufferInfo(this.gl, propSchema, bufferChunkSize)
      plugin.bufferSizes = getBufferKeys(propSchema)
        .reduce((map, key) => ({ ...map, [key]: bufferChunkSize }), {})
    })
  }

  addElement (element) {
    const { gl, config, elements, plugins, glUtils, globals } = this
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]
      const { name } = plugin.constructor
      if (!element.plugins[name]) continue

      const { buffers, propSchema, bufferSizes } = plugin
      const baseBufferProps = plugin.propsByElement(element)
      const bufferKeys = getBufferKeys(propSchema)
      const { bufferChunkSize } = config
      const lastElement = elements[elements.length - 1]
      const bufferProps = alignBufferProps(
        lastElement, name, bufferKeys, baseBufferProps, propSchema
      )
      const [fullKeys, subKeys] = divideUploadKeys(
        elements, name, bufferKeys, bufferProps, propSchema, bufferChunkSize
      )
      const { uploadSubBuffers, uploadFullBuffers } = glUtils
      element.bufferPropsMap[name] = bufferProps
      allocateBufferSizes(
        fullKeys, propSchema, bufferSizes, bufferChunkSize, bufferProps
      )
      push(elements, element)
      uploadFullBuffers(
        gl, fullKeys, name, elements, bufferSizes, buffers, propSchema
      )
      const subElements = elements.slice(0, elements.length - 1)
      uploadSubBuffers(
        gl, subKeys, name, subElements, bufferProps, buffers, propSchema
      )

      const { textureMap, elementCodeMaps } = plugin
      const { uploadTexture } = glUtils
      const uniformProps = {
        ...plugin.propsByGlobals(globals),
        ...plugin.propsByElement(element)
      }
      const textureKeys = Object
        .keys(propSchema)
        .filter(key => propSchema[key].type === PropTypes.uniform)

      textureKeys.forEach(key => {
        const image = uniformProps[key]
        if (!textureMap.get(image)) {
          const texture = uploadTexture(gl, image)
          textureMap.set(image, texture)
        }
      })

      let code = ''
      textureKeys.forEach(key => {
        let char = getCharFromMaps(uniformProps[key], elementCodeMaps)
        if (!char) char = generateChar()
        setCharToMaps(uniformProps[key], char, elementCodeMaps)
        code += char
      })
      element.codes[name] = code
    }
  }

  changeElement (element, props) {
    const { gl, elements, plugins, glUtils } = this
    element.props = props
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]
      const { name } = plugin.constructor
      if (!element.plugins[name]) continue

      const { buffers, propSchema, bufferLengthMap } = plugin
      const bufferProps = plugin.propsByElement(element)
      const bufferKeys = getBufferKeys(propSchema)
      const uploadOffset = getUploadOffset(
        element, elements, bufferKeys, bufferLengthMap
      )
      const bufferLengths = getBufferLengths(
        bufferKeys, bufferProps, propSchema
      )
      const { uploadSubBuffers } = glUtils
      element.bufferProps[name] = bufferProps
      bufferLengthMap.set(element, bufferLengths)
      uploadSubBuffers(
        gl, bufferKeys, uploadOffset, bufferProps, buffers, propSchema
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
      if (!element.plugins[name]) continue

      const { buffers, propSchema, bufferLengthMap, bufferSizes } = plugin
      const bufferProps = plugin.propsByElement(element)
      const bufferKeys = getBufferKeys(propSchema)
      const bufferLengths = getBufferLengths(
        bufferKeys, bufferProps, propSchema
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
        propSchema
      )
    }
  }

  setGlobal (field, props) {
    this.globals[field] = props
  }

  render () {
    const { gl, glUtils, plugins, globals, elements } = this
    if (!elements.length) return

    const { resetBeforeDraw, draw } = glUtils
    resetBeforeDraw(gl)
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]
      const { name } = plugin.constructor
      const {
        programInfo,
        buffers,
        propSchema,
        textureMap
      } = plugin
      const indexKey = Object
        .keys(propSchema)
        .find(key => propSchema[key].index)

      let totalLength = 0
      for (let i = 0; i < elements.length; i++) {
        totalLength += elements[i].bufferPropsMap[name][indexKey].length
      }

      const props = {
        ...plugin.propsByElement(elements[0]), // FIXME
        ...plugin.propsByGlobals(globals)
      }
      draw(gl, programInfo, buffers, propSchema, totalLength, textureMap, props)
    }
  }
}
