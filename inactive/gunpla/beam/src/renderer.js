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
  concat,
  push,
  getBufferKeys,
  createRelatedElementsGroup,
  allocateBufferSizes,
  getLastRelatedElement,
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
  uploadSubBuffers,
  uploadFullBuffers,
  clearBuffers,
  uploadTexture,
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
    this.addElements([element])
  }

  addElements (elements) {
    const { gl, config, plugins, glUtils, globals } = this
    const prevElements = this.elements
    const relatedElementsGroup = createRelatedElementsGroup(plugins, elements)

    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]
      const { name } = plugin.constructor
      const relatedElements = relatedElementsGroup[i]
      if (!relatedElements.length) continue

      const newElements = [...prevElements, ...relatedElements]
      const bufferPropsGroup = []
      for (let j = 0; j < relatedElements.length; j++) {
        const bufferProps = plugin.propsByElement(relatedElements[j])
        push(bufferPropsGroup, bufferProps)
      }
      const { bufferChunkSize } = config
      const lastElement = getLastRelatedElement(prevElements, name)
      const bufferProps = alignBufferProps(
        plugin, bufferPropsGroup, lastElement, relatedElements
      )
      const [fullKeys, subKeys] = divideUploadKeys(
        plugin, prevElements, bufferProps, bufferChunkSize
      )
      const { uploadSubBuffers, uploadFullBuffers } = glUtils

      allocateBufferSizes(plugin, fullKeys, bufferProps, bufferChunkSize)
      uploadFullBuffers(gl, plugin, fullKeys, newElements)
      uploadSubBuffers(gl, plugin, bufferProps, subKeys, prevElements)
      updateCodeMapsByTextures(
        gl, plugin, relatedElements, globals, uploadTexture
      )
      divideElementGroups(plugin, newElements)
    }
    concat(prevElements, elements)
    this.texLoaded = false
  }

  changeElement (element, state) {
    const { gl, elements, plugins, glUtils } = this
    element.state = state
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]
      const { name } = plugin.constructor
      if (!element.plugins[name]) continue

      const { propSchema } = plugin
      const baseBufferProps = plugin.propsByElement(element)
      const bufferKeys = getBufferKeys(propSchema)
      const lastElement = elements[elements.indexOf(element) - 1]
      const bufferProps = alignBufferProps(
        plugin, [baseBufferProps], lastElement, [element]
      )
      const { uploadSubBuffers } = glUtils
      element.bufferPropsMap[name] = bufferProps
      const subElements = elements.slice(0, elements.indexOf(element))
      uploadSubBuffers(gl, plugin, bufferProps, bufferKeys, subElements)
    }
    this.texLoaded = false
  }

  removeElement (element) {
    this.removeElements([element])
  }

  removeElements (elements) {
    const { gl, plugins, glUtils } = this
    const { clearBuffers } = glUtils
    const remainedElements = this.elements.filter(el => !elements.includes(el))
    for (let i = 0; i < plugins.length; i++) clearBuffers(gl, plugins[i])
    this.elements = []
    this.addElements(remainedElements)
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
      const elementsGroup = divideElementsByCode(elements, name)
      const { drawByGroup } = glUtils

      plugin.beforeDraw(gl)
      drawByGroup(gl, plugin, elementsGroup, globals, this.texLoaded)
    }
    this.texLoaded = true
  }
}
