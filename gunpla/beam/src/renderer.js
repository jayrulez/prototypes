import {
  getWebGLInstance,
  initProgramInfo,
  initBufferInfo,
  initFramebufferObject,
  uploadSubBuffers,
  uploadFullBuffers,
  uploadIndexBuffers,
  clearBuffers,
  uploadTexture,
  resetBeforeDraw,
  draw
} from './utils/gl-utils.js'
import { RendererConfig } from './consts.js'
import {
  push,
  getBufferKeys,
  allocateBufferSizes,
  getLastPluggedElement,
  updateCodeMapsByTextures,
  createBufferIndexGroup,
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
  uploadIndexBuffers,
  clearBuffers,
  uploadTexture,
  resetBeforeDraw,
  draw
}

export class Renderer {
  constructor (
    canvas, plugins, config = RendererConfig, utils = defaultUtils
  ) {
    this.texLoaded = false
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
      const {
        vertexShader,
        fragmentShader,
        shaderSchema,
        propSchema
      } = plugin
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

      const { buffers, propSchema, bufferSizes } = plugin
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
      uploadFullBuffers(
        gl, fullKeys, name, elements, bufferSizes, buffers, propSchema
      )
      const subElements = elements.slice(0, elements.length - 1)
      uploadSubBuffers(
        gl, subKeys, name, subElements, bufferProps, buffers, propSchema
      )
      updateCodeMapsByTextures(gl, element, globals, plugin, uploadTexture)
      const elementGroups = divideElementsByCode(elements, name)
      const indexKey = Object
        .keys(propSchema)
        .find(key => propSchema[key].index)
      plugin.bufferIndexGroup = createBufferIndexGroup(
        elementGroups, plugin, indexKey
      )
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

      const { buffers, propSchema } = plugin
      const baseBufferProps = plugin.propsByElement(element)
      const bufferKeys = getBufferKeys(propSchema)
      const lastElement = elements[elements.indexOf(element) - 1]
      const bufferProps = alignBufferProps(
        lastElement, name, bufferKeys, baseBufferProps, propSchema
      )
      const { uploadSubBuffers } = glUtils
      element.bufferPropsMap[name] = bufferProps
      const subElements = elements.slice(0, elements.indexOf(element))
      uploadSubBuffers(
        gl, bufferKeys, name, subElements, bufferProps, buffers, propSchema
      )
    }
    this.texLoaded = false
  }

  removeElement (element) {
    const { gl, plugins } = this
    const { clearBuffers } = this.glUtils
    const remainedElements = this.elements.filter(el => el !== element)

    for (let i = 0; i < plugins.length; i++) {
      const { propSchema, buffers, bufferSizes } = plugins[i]
      clearBuffers(gl, bufferSizes, buffers, propSchema)
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
    const { resetBeforeDraw, draw } = glUtils
    resetBeforeDraw(gl, clearColor)
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]
      const { name } = plugin.constructor
      const {
        programInfo,
        buffers,
        bufferIndexGroup,
        propSchema,
        textureMap
      } = plugin
      const indexKey = Object
        .keys(propSchema)
        .find(key => propSchema[key].index)

      const elementGroups = divideElementsByCode(elements, name)
      const { uploadIndexBuffers } = glUtils

      plugin.beforeDraw(gl)

      for (let i = 0; i < elementGroups.length; i++) {
        const groupedElements = elementGroups[i]
        uploadIndexBuffers(gl, bufferIndexGroup[i], buffers, propSchema)

        let totalLength = 0
        for (let i = 0; i < groupedElements.length; i++) {
          const indexProp = groupedElements[i].bufferPropsMap[name][indexKey]
          if (indexProp instanceof ArrayBuffer) {
            totalLength += indexProp.byteLength / 2
          } else {
            totalLength += indexProp.length
          }
        }
        const props = {
          // Should always has length, always same element props in same batch
          ...plugin.propsByElement(groupedElements[0]),
          ...plugin.propsByGlobals(globals)
        }
        draw(
          gl,
          programInfo,
          buffers,
          propSchema,
          totalLength,
          textureMap,
          props,
          this.texLoaded
        )
      }
      this.texLoaded = true
    }
  }
}
