import {
  getWebGLInstance,
  initProgramInfo,
  initBufferInfo,
  initFramebufferObject,
  uploadFullBuffers,
  uploadSubBuffers,
  uploadTexture,
  clearBuffers,
  resetBeforeDraw,
  drawByGroup
} from './utils/gl-utils.js'
import { RendererConfig } from './consts.js'
import {
  push,
  getBufferKeys,
  allocateBufferSizes,
  getLastPluggedElement,
  updateCodeMapsByTextures,
  divideElementGroups,
  divideUploadKeys,
  alignBufferProps,
  divideElementsByCode
} from './utils/misc.js'

const defaultUtils = {
  getWebGLInstance,
  initProgramInfo,
  initBufferInfo,
  initFramebufferObject,
  uploadFullBuffers,
  uploadSubBuffers,
  uploadTexture,
  clearBuffers,
  resetBeforeDraw,
  drawByGroup
}

export class Renderer {
  constructor (
    canvas, plugins, config = RendererConfig, utils = defaultUtils
  ) {
    this.texLoaded = false
    this.plugins = plugins
    this.globals = {}
    this.config = { ...RendererConfig, ...config }
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
      const { vertexShader, fragmentShader, shaderSchema, propSchema } = plugin
      plugin.programInfo = initProgramInfo(
        this.gl, shaderSchema, vertexShader, fragmentShader
      )
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

      const { propSchema, bufferSizes } = plugin
      const baseBufferProps = plugin.propsByElement(element)
      const bufferKeys = getBufferKeys(propSchema)
      const { bufferChunkSize } = config
      const lastElement = getLastPluggedElement(elements, name)
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
      uploadFullBuffers(gl, plugin, fullKeys, elements)
      const subElements = elements.slice(0, elements.length - 1)
      uploadSubBuffers(gl, plugin, subKeys, subElements, element)
      updateCodeMapsByTextures(gl, element, globals, plugin, uploadTexture)
      divideElementGroups(elements, plugin)
    }
    this.texLoaded = false
  }

  changeElement (element, props) {
    const { gl, elements, plugins, glUtils } = this
    element.props = props
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]
      const { name } = plugin.constructor
      if (!element.plugins[name]) continue

      const { propSchema } = plugin
      const baseBufferProps = plugin.propsByElement(element)
      const bufferKeys = getBufferKeys(propSchema)
      const lastElement = elements[elements.indexOf(element) - 1]
      const bufferProps = alignBufferProps(
        lastElement, name, bufferKeys, baseBufferProps, propSchema
      )
      const { uploadSubBuffers } = glUtils
      element.bufferPropsMap[name] = bufferProps
      const subElements = elements.slice(0, elements.indexOf(element))
      uploadSubBuffers(gl, plugin, bufferKeys, subElements, element)
    }
    this.texLoaded = false
  }

  removeElement (element) {
    const { gl, plugins, glUtils } = this
    const { clearBuffers } = glUtils
    const remainedElements = this.elements.filter(el => el !== element)

    for (let i = 0; i < plugins.length; i++) {
      clearBuffers(gl, plugins[i])
    }

    this.elements = []
    // TODO perf
    for (let i = 0; i < remainedElements.length; i++) {
      this.addElement(remainedElements[i])
    }
  }

  setGlobal (field, props) {
    this.globals[field] = props
  }

  render () {
    const { gl, glUtils, plugins, globals, elements, config } = this
    const { clearColor } = config
    const { resetBeforeDraw } = glUtils
    resetBeforeDraw(gl, clearColor)
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]
      const { name } = plugin.constructor
      const elementGroups = divideElementsByCode(elements, name)
      const { drawByGroup } = glUtils

      plugin.beforeDraw(gl)
      drawByGroup(gl, plugin, elementGroups, globals, this.texLoaded)
      this.texLoaded = true
    }
  }
}
