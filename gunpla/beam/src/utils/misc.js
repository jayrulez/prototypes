// Includes all non-gl utils methods for core renderer lib here

import { BufferTypes } from '../consts.js'

export const max = arr => {
  if (!arr.length) return null
  let max = arr[0]
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i]
  }
  return max
}

export const push = (arr, x) => { arr[arr.length] = x }

export const bufferTypeSize = type => type === BufferTypes.float ? 4 : 2

// uploadOffset: { keys: { keyA, keyB, keyC... }, index }
export const getUploadOffset = (elements, bufferKeys, bufferLengthMap) => {
  const uploadOffset = {
    keys: bufferKeys.reduce((map, key) => ({ ...map, [key]: 0 }), {}),
    index: 0
  }

  for (let i = 0; i < elements.length; i++) {
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
  bufferKeys, bufferSchema, bufferProps, bufferChunkSize, uploadOffset
) => {
  const fullKeys = []
  const subKeys = []
  for (let i = 0; i < bufferKeys.length; i++) {
    const key = bufferKeys[i]
    const size = bufferTypeSize(bufferSchema[key])
    const need = (uploadOffset.keys[key] + bufferProps[key].length) * size
    need < bufferChunkSize ? push(subKeys, key) : push(fullKeys, key)
  }
  return [fullKeys, subKeys]
}

export const allocateBufferSizes = (
  fullKeys, bufferSchema, bufferSizes, bufferChunkSize, bufferProps
) => {
  for (let i = 0; i < fullKeys.length; i++) {
    const key = fullKeys[i]
    const size = bufferTypeSize(bufferSchema[key])
    bufferSizes[key] += Math.max(
      bufferChunkSize, bufferProps[key].length * size
    )
  }
}

// bufferLengths: { keys: { keyA, keyB, keyC... }, index }
export const getBufferLengths = (bufferKeys, bufferProps, bufferSchema) => {
  const indexKey = bufferKeys.find(key => bufferSchema[key].index)
  return {
    keys: bufferKeys.reduce(
      (map, key) => ({ ...map, [key]: bufferProps[key].length }), {}
    ),
    index: max(bufferProps[indexKey]) + 1
  }
}
