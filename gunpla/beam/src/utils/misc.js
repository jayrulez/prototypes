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

// Prop keys with numComponents must be attribute floats
export const bufferTypeSize = (propSchema, key) => propSchema[key].n ? 4 : 2

export const getBufferKeys = (propSchema) => Object
  .keys(propSchema)
  .filter(key => propSchema[key].type === PropTypes.attribute)

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

// uploadOffset: { keys: { keyA, keyB, keyC... }, index }
export const getUploadOffset = (
  element, elements, bufferKeys, bufferLengthMap
) => {
  const uploadOffset = {
    keys: bufferKeys.reduce((map, key) => ({ ...map, [key]: 0 }), {}),
    index: 0
  }

  for (let i = 0; i < elements.length; i++) {
    if (elements[i] === element) break
    const elementBufferLengths = bufferLengthMap.get(elements[i])
    if (elementBufferLengths) {
      uploadOffset.index += elementBufferLengths.index
    }
    for (let j = 0; j < bufferKeys.length; j++) {
      const key = bufferKeys[j]
      uploadOffset.keys[key] += elementBufferLengths.keys[key]
    }
  }

  return uploadOffset
}

export const divideUploadKeys = (
  bufferKeys, propSchema, bufferProps, bufferChunkSize, uploadOffset
) => {
  const fullKeys = []
  const subKeys = []
  for (let i = 0; i < bufferKeys.length; i++) {
    const key = bufferKeys[i]
    const size = bufferTypeSize(propSchema, key)
    const need = (uploadOffset.keys[key] + bufferProps[key].length) * size
    need < bufferChunkSize ? push(subKeys, key) : push(fullKeys, key)
  }
  return [fullKeys, subKeys]
}

export const allocateBufferSizes = (
  fullKeys, propSchema, bufferSizes, bufferChunkSize, bufferProps
) => {
  for (let i = 0; i < fullKeys.length; i++) {
    const key = fullKeys[i]
    const size = bufferTypeSize(propSchema, key)
    bufferSizes[key] += Math.max(
      bufferChunkSize, bufferProps[key].length * size
    )
  }
}

// bufferLengths: { keys: { keyA, keyB, keyC... }, index }
export const getBufferLengths = (bufferKeys, bufferProps, propSchema) => {
  const indexKey = bufferKeys.find(key => propSchema[key].index)
  return {
    keys: bufferKeys.reduce(
      (map, key) => ({ ...map, [key]: bufferProps[key].length }), {}
    ),
    index: max(bufferProps[indexKey]) + 1
  }
}
