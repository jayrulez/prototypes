// Includes all non-gl utils methods for core renderer lib here

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

export const isPowerOf2 = value => (value & (value - 1)) === 0

export const mapValue = (obj, mapper) => Object
  .keys(obj)
  .reduce((newObj, key) => ({ ...newObj, [key]: mapper(obj, key) }), {})

// Prop keys with numComponents must be attribute floats
export const bufferTypeSize = (propSchema, key) => propSchema[key].n ? 4 : 2

export const getBufferKeys = (propSchema) => Object
  .keys(propSchema)
  .filter(key => propSchema[key].type === PropTypes.buffer)

let i = 66 // ASCII 'B' for Beam
export const generateChar = () => {
  const char = String.fromCharCode(i)
  i++
  return char
}

export const getCharFromMaps = (data, [weakMap, map]) => {
  return data instanceof Object
    ? (weakMap.get(data) || '')
    : (map[data] || '')
}

export const setCharToMaps = (data, char, [weakMap, map]) => {
  data instanceof Object
    ? weakMap.set(data, char)
    : map[data] = char
}

export const alignBufferProps = (
  baseElement, name, bufferKeys, bufferProps, propSchema
) => {
  const indexKey = bufferKeys.find(key => propSchema[key].index)
  if (
    !baseElement ||
    !indexKey ||
    !baseElement.bufferPropsMap[name]
  ) return bufferProps

  const indexValueOffset = max(baseElement.bufferPropsMap[name][indexKey]) + 1

  const offsetIndexArr = []
  for (let i = 0; i < bufferProps[indexKey].length; i++) {
    push(offsetIndexArr, bufferProps[indexKey][i] + indexValueOffset)
  }

  return { ...bufferProps, [indexKey]: offsetIndexArr }
}

export const bufferPropOffset = (elements, name, key) => {
  let sum = 0
  for (let i = 0; i < elements.length; i++) {
    if (!elements[i].plugins[name]) continue
    sum += elements[i].bufferPropsMap[name][key].length
  }
  return sum
}

export const getLastPluggedElement = (elements, name) => {
  for (let i = elements.length - 1; i >= 0; i--) {
    if (elements[i].plugins[name]) {
      return elements[i]
    }
  }
}

export const createBufferIndexGroup = (elementGroups, plugin, indexKey) => {
  const { name } = plugin.constructor

  const bufferIndexGroup = []
  for (let i = 0; i < elementGroups.length; i++) {
    const elements = elementGroups[i]
    let indexGroup = []
    for (let j = 0; j < elements.length; j++) {
      const indexProps = elements[j].bufferPropsMap[name][indexKey]
      // can be [0, 1, 2, 2, 3, 4...] with normal array
      // and [ArrayBuffer, ArrayBuffer] with array buffer
      indexGroup = indexGroup.concat(indexProps)
    }
    push(bufferIndexGroup, indexGroup)
  }
  return bufferIndexGroup
}

export const divideUploadKeys = (
  elements, name, bufferKeys, bufferProps, propSchema, bufferChunkSize
) => {
  const fullKeys = []
  const subKeys = []
  for (let i = 0; i < bufferKeys.length; i++) {
    const key = bufferKeys[i]
    const size = bufferTypeSize(propSchema, key)
    const baseSpace = bufferPropOffset(elements, name, key) * size
    const spaceRequired = baseSpace + (bufferProps[key] instanceof ArrayBuffer)
      ? bufferProps[key].byteLength
      : bufferProps[key].length * size

    spaceRequired < bufferChunkSize ? push(subKeys, key) : push(fullKeys, key)
  }
  return [fullKeys, subKeys]
}

export const allocateBufferSizes = (
  fullKeys, propSchema, bufferSizes, bufferChunkSize, bufferProps
) => {
  for (let i = 0; i < fullKeys.length; i++) {
    const key = fullKeys[i]
    const size = bufferTypeSize(propSchema, key)
    const length = bufferProps[key] instanceof ArrayBuffer
      ? bufferProps[key].byteLength
      : bufferProps[key].length * size
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
