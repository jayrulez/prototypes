// Include all non-gl util methods for core renderer lib here

import { PropTypes } from '../consts.js'

export const max = arr => {
  if (!arr.length) return null
  let max = arr[0]
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i]
  }
  return max
}

export const push = (arr, x) => { arr[arr.length] = x }

export const concat = (baseArr, newArr) => {
  const baseLength = baseArr.length
  for (let i = 0; i < newArr.length; i++) {
    baseArr[baseLength + i] = newArr[i]
  }
}

export const isPowerOf2 = value => (value & (value - 1)) === 0

export const mapValue = (obj, valueMapper) => Object
  .keys(obj)
  .reduce((newObj, key) => ({ ...newObj, [key]: valueMapper(obj, key) }), {})

// Prop keys with numComponents must be attribute floats
export const bufferTypeSize = (propSchema, key) => propSchema[key].n ? 4 : 2

export const getBufferKeys = propSchema => Object
  .keys(propSchema)
  .filter(key => propSchema[key].type === PropTypes.buffer)

// Plugin only cares about `relatedElements` marked by plugin's name
export const createRelatedElementsGroup = (plugins, elements) => {
  const relatedElementsGroup = plugins.map(() => [])
  for (let i = 0; i < plugins.length; i++) {
    const plugin = plugins[i]
    const { name } = plugin.constructor
    for (let j = 0; j < elements.length; j++) {
      if (!elements[j].plugins[name]) continue
      push(relatedElementsGroup[i], elements[j])
    }
  }
  return relatedElementsGroup
}

const joinBufferProps = (
  plugin, bufferPropsGroup, relatedElements, baseIndexOffset = 0
) => {
  if (!bufferPropsGroup.length) return {}
  const { propSchema } = plugin
  const { name } = plugin.constructor

  const joinedBufferProps = mapValue(bufferPropsGroup[0], () => [])
  const bufferKeys = getBufferKeys(propSchema)
  const indexKey = bufferKeys.find(key => propSchema[key].index)

  let indexOffset = baseIndexOffset
  for (let i = 0; i < bufferPropsGroup.length; i++) {
    const bufferProps = bufferPropsGroup[i]
    const element = relatedElements[i]
    const offsetIndexArr = []
    for (let i = 0; i < bufferProps[indexKey].length; i++) {
      push(offsetIndexArr, bufferProps[indexKey][i] + indexOffset)
    }
    element.bufferPropsMap[name] = {
      ...bufferProps, [indexKey]: offsetIndexArr
    }
    // TypedArray props are converted to plain array props here
    bufferKeys.forEach(key => {
      concat(joinedBufferProps[key], element.bufferPropsMap[name][key])
    })
    indexOffset = max(offsetIndexArr) + 1
  }
  return joinedBufferProps
}

export const alignBufferProps = (
  plugin,
  bufferPropsGroup,
  baseElement,
  relatedElements
) => {
  const { propSchema } = plugin
  const { name } = plugin.constructor
  const bufferKeys = getBufferKeys(propSchema)
  const indexKey = bufferKeys.find(key => propSchema[key].index)
  if (
    !baseElement ||
    !indexKey ||
    !baseElement.bufferPropsMap[name]
  ) return joinBufferProps(plugin, bufferPropsGroup, relatedElements, 0)

  const indexOffset = max(baseElement.bufferPropsMap[name][indexKey]) + 1

  return joinBufferProps(plugin, bufferPropsGroup, relatedElements, indexOffset)
}

export const bufferPropOffset = (elements, name, key) => {
  let sum = 0
  for (let i = 0; i < elements.length; i++) {
    if (!elements[i].plugins[name]) continue
    sum += elements[i].bufferPropsMap[name][key].length
  }
  return sum
}

export const getLastRelatedElement = (elements, name) => {
  for (let i = elements.length - 1; i >= 0; i--) {
    if (elements[i].plugins[name]) {
      return elements[i]
    }
  }
}

export const divideUploadKeys = (
  plugin, elements, bufferProps, bufferChunkSize
) => {
  const { propSchema } = plugin
  const { name } = plugin.constructor
  const bufferKeys = getBufferKeys(propSchema)
  const fullKeys = []
  const subKeys = []
  for (let i = 0; i < bufferKeys.length; i++) {
    const key = bufferKeys[i]
    const size = bufferTypeSize(propSchema, key)
    const baseOffset = bufferPropOffset(elements, name, key) * size
    const length = bufferProps[key].length * size
    const spaceRequired = baseOffset + length
    spaceRequired < bufferChunkSize ? push(subKeys, key) : push(fullKeys, key)
  }
  return [fullKeys, subKeys]
}

export const allocateBufferSizes = (
  plugin, fullKeys, bufferProps, bufferChunkSize
) => {
  const { propSchema, bufferSizes } = plugin
  for (let i = 0; i < fullKeys.length; i++) {
    const key = fullKeys[i]
    const size = bufferTypeSize(propSchema, key)
    const length = bufferProps[key].length * size
    bufferSizes[key] += Math.max(bufferChunkSize, length)
  }
}

export const divideElementsByCode = (elements, name) => {
  const results = {}

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]
    if (!element.plugins[name]) continue

    const code = element.codes[name]
    results[code] ? push(results[code], element) : results[code] = [element]
  }

  return Object.keys(results).map(key => results[key])
}

let i = 66 // ASCII 'B' for Beam
const generateChar = () => {
  const char = String.fromCharCode(i)
  i++
  return char
}

const getCharFromMaps = (data, [weakMap, map]) => {
  return data instanceof Object
    ? (weakMap.get(data) || '')
    : (map[data] || '')
}

const setCharToMaps = (data, char, [weakMap, map]) => {
  data instanceof Object
    ? weakMap.set(data, char)
    : map[data] = char
}

export const updateCodeMapsByTextures = (
  gl, plugin, relatedElements, globals, uploadTexture
) => {
  for (let i = 0; i < relatedElements.length; i++) {
    const element = relatedElements[i]
    const { propSchema, textureMap, elementCodeMaps } = plugin
    const { name } = plugin.constructor
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
  }
}

// All plugin-related elements are divided into `elementGroups` in the shape of:
// [Element[], Element[]...]
// So we create corresponding `indexPropsGroup` in the shape of:
// [[0, 1, 2, 0, 2, 3...], [100, 101, 102, 100, 102, 103...]...]
const createIndexPropsGroup = (plugin, elementsGroup, indexKey) => {
  const { name } = plugin.constructor
  const indexPropsGroup = []
  for (let i = 0; i < elementsGroup.length; i++) {
    const elements = elementsGroup[i]
    let indexProps = []
    for (let j = 0; j < elements.length; j++) {
      const baseIndexProps = elements[j].bufferPropsMap[name][indexKey]
      // flat [0, 1, 2, 2, 3, 4...] with default array
      concat(indexProps, baseIndexProps)
    }
    push(indexPropsGroup, indexProps)
  }

  return indexPropsGroup
}

export const divideElementGroups = (plugin, elements) => {
  const { propSchema } = plugin
  const { name } = plugin.constructor
  const elementsGroup = divideElementsByCode(elements, name)
  const indexKey = Object
    .keys(propSchema)
    .find(key => propSchema[key].index)
  plugin.indexPropsGroups = createIndexPropsGroup(
    plugin, elementsGroup, indexKey
  )
}
