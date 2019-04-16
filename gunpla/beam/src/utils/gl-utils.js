// Includes all gl-related methods here

import { ShaderTypes } from '../consts.js'
import {
  isPowerOf2,
  getBufferKeys,
  bufferPropOffset
} from '../utils/misc.js'

export const getWebGLInstance = canvas => canvas.getContext('webgl')

const compileShader = (gl, type, source) => {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Error compiling shaders', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

const initShader = (gl, vSource, fSource) => {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vSource)
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fSource)

  const shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Failed to init program', gl.getProgramInfoLog(shaderProgram))
    return null
  }

  return shaderProgram
}

export const initProgramInfo = (gl, programSchema) => {
  const { vertexShader, fragmentShader } = programSchema
  const program = initShader(gl, vertexShader, fragmentShader)
  return {
    program,
    attributes: Object.keys(programSchema.attributes).reduce((map, key) => ({
      ...map,
      [key]: {
        type: programSchema.attributes[key],
        location: gl.getAttribLocation(program, key)
      }
    }), {}),
    uniforms: Object.keys(programSchema.uniforms).reduce((map, key) => ({
      ...map,
      [key]: {
        type: programSchema.uniforms[key],
        location: gl.getUniformLocation(program, key)
      }
    }), {})
  }
}

export const uploadTexture = (gl, image) => {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

  if (
    isPowerOf2(image.width) && isPowerOf2(image.height) &&
    image.nodeName !== 'VIDEO'
  ) {
    gl.generateMipmap(gl.TEXTURE_2D)
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  }
  return texture
}

export const initBufferInfo = (gl, propSchema, bufferChunkSize) => {
  const buffers = {}
  const bufferKeys = getBufferKeys(propSchema)
  bufferKeys.forEach(key => {
    const buffer = gl.createBuffer()
    const { index } = propSchema[key]
    const target = index ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER
    gl.bindBuffer(target, buffer)
    gl.bufferData(target, bufferChunkSize, gl.STATIC_DRAW)
    buffers[key] = buffer
  })
  return buffers
}

export const uploadFullBuffers = (
  gl, bufferKeys, name, elements, bufferSizes, buffers, propSchema
) => {
  if (!bufferKeys.length) return

  // Join props of elements
  // props: { keyA, keyB, keyC... }
  const props = bufferKeys.reduce((map, key) => ({ ...map, [key]: [] }), {})
  for (let i = 0; i < elements.length; i++) {
    const elementBufferProps = elements[i].bufferPropsMap[name]
    if (!elementBufferProps) continue

    for (let j = 0; j < bufferKeys.length; j++) {
      const key = bufferKeys[j]
      props[key] = props[key].concat(elementBufferProps[key])
    }
  }

  bufferKeys.forEach(key => {
    const { index } = propSchema[key]
    const target = index ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER
    let data = props[key]
    if (data[0] instanceof ArrayBuffer) data = data[0]
    const arr = index ? new Uint16Array(data) : new Float32Array(data)

    gl.bindBuffer(target, buffers[key])
    gl.bufferData(target, bufferSizes[key], gl.STATIC_DRAW)
    gl.bufferData(target, arr, gl.STATIC_DRAW)
  })
}

export const uploadSubBuffers = (
  gl, bufferKeys, name, elements, bufferProps, buffers, propSchema
) => {
  if (!bufferKeys.length) return

  bufferKeys.forEach(key => {
    const { index } = propSchema[key]
    const target = index ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER
    const commonOffset = bufferPropOffset(elements, name, key)

    if (index) return

    let data = bufferProps[key]
    if (data[0] instanceof ArrayBuffer) data = data[0]

    const arr = index ? new Uint16Array(data) : new Float32Array(data)
    const size = index ? 2 : 4

    gl.bindBuffer(target, buffers[key])
    gl.bufferSubData(target, commonOffset * size, arr)
  })
}

export const uploadIndexBuffers = (
  gl, indexGroup, buffers, propSchema
) => {
  const bufferKeys = getBufferKeys(propSchema)
  const indexKey = bufferKeys.find(key => propSchema[key].index)
  let data = indexGroup
  if (data[0] instanceof ArrayBuffer) data = data[0]
  const arr = new Uint16Array(data)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[indexKey])
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arr, gl.STATIC_DRAW)
}

export const initFramebufferObject = (gl) => {
  let framebuffer, texture, depthBuffer

  const error = () => {
    if (framebuffer) gl.deleteFramebuffer(framebuffer)
    if (texture) gl.deleteTexture(texture)
    if (depthBuffer) gl.deleteRenderbuffer(depthBuffer)
    return null
  }

  framebuffer = gl.createFramebuffer()
  if (!framebuffer) {
    console.error('Failed to create framebuffer object')
    return error()
  }

  texture = gl.createTexture()
  if (!texture) {
    console.error('Failed to create texture object')
    return error()
  }

  depthBuffer = gl.createRenderbuffer()
  if (!depthBuffer) {
    console.error('Failed to create renderbuffer object')
    return error()
  }

  const size = 1024

  // Texture
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null
  )
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

  // Depth buffer
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size, size)

  // FBO
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0
  )
  gl.framebufferRenderbuffer(
    gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer
  )

  const e = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
  if (gl.FRAMEBUFFER_COMPLETE !== e) {
    console.error('Frame buffer object is incomplete: ' + e.toString())
    return error()
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.bindTexture(gl.TEXTURE_2D, null)
  gl.bindRenderbuffer(gl.RENDERBUFFER, null)

  return { framebuffer, texture }
}

export const resetBeforeDraw = gl => {
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clearDepth(1.0)
  gl.disable(gl.BLEND)
  gl.enable(gl.DEPTH_TEST)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
}

export const draw = (
  gl, programInfo, buffers, propSchema, totalLength, textureMap, props
) => {
  gl.useProgram(programInfo.program)

  let indexBuffer = null
  const bufferKeys = getBufferKeys(propSchema)
  bufferKeys.forEach(key => {
    if (!programInfo.attributes[key] && propSchema[key].index) {
      indexBuffer = buffers[key]
    } else {
      const { location } = programInfo.attributes[key]
      const { n } = propSchema[key]
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers[key])
      const bufferType = n ? gl.FLOAT : gl.INT
      gl.vertexAttribPointer(location, n, bufferType, false, 0, 0)
      gl.enableVertexAttribArray(location)
    }
  })
  indexBuffer && gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

  Object.keys(programInfo.uniforms).forEach(key => {
    const { location, type } = programInfo.uniforms[key]
    const prop = props[key]
    const uniformSetterMapping = {
      [ShaderTypes.vec4]: () => gl.uniform4fv(location, prop),
      [ShaderTypes.vec3]: () => gl.uniform3fv(location, prop),
      [ShaderTypes.vec2]: () => gl.uniform2fv(location, prop),
      [ShaderTypes.float]: () => gl.uniform1f(location, prop),
      [ShaderTypes.int]: () => gl.uniform1i(location, prop),
      [ShaderTypes.mat4]: () => gl.uniformMatrix4fv(location, false, prop),
      [ShaderTypes.mat3]: () => gl.uniformMatrix3fv(location, false, prop),
      [ShaderTypes.mat2]: () => gl.uniformMatrix2fv(location, false, prop),
      [ShaderTypes.sampler2D]: () => {
        gl.uniform1i(location, 0)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, textureMap.get(prop))
        gl.texImage2D(
          gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, prop
        )
      }
    }
    uniformSetterMapping[type]()
  })

  gl.drawElements(gl.TRIANGLES, totalLength, gl.UNSIGNED_SHORT, 0)
}
