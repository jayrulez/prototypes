import {
  getWebGLInstance,
  initProgramInfo,
  initBufferInfo,
  initFramebufferObject,
  uploadSubBuffers,
  uploadFullBuffers,
  uploadIndexBuffers,
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
  getLastPluggedElement,
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

      const { textureMap, elementCodeMaps } = plugin
      const { uploadTexture } = glUtils
      const props = {
        ...plugin.propsByGlobals(globals),
        ...plugin.propsByElement(element)
      }
      const textureKeys = Object
        .keys(propSchema)
        .filter(key => propSchema[key].type === PropTypes.texture)

      textureKeys.forEach(key => {
        const imageLike = props[key] // can be cubemap config or image
        if (!textureMap.get(imageLike)) {
          const texture = uploadTexture(gl, imageLike, propSchema[key])
          textureMap.set(imageLike, texture)
        }
      })

      let code = ''
      textureKeys.forEach(key => {
        let char = getCharFromMaps(props[key], elementCodeMaps)
        if (!char) char = generateChar()
        setCharToMaps(props[key], char, elementCodeMaps)
        code += char
      })
      element.codes[name] = code || 'A'

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
  }

  removeElement (element) {
    const copyElements = this.elements.filter(el => el !== element)
    this.elements = []
    // TODO perf
    for (let i = 0; i < copyElements.length; i++) {
      this.addElement(copyElements[i])
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
        this.texLoaded = true
      }
    }
  }
}
