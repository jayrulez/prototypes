// Includes all gl-related methods here

import { ShaderTypes, BufferTypes } from '../consts.js'
import { max, push } from '../utils/misc.js'

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

export const initBufferInfo = (gl, bufferSchema, bufferChunkSize) => {
  const buffers = {}
  Object.keys(bufferSchema).forEach(key => {
    const buffer = gl.createBuffer()
    const { index } = bufferSchema[key]
    const target = index ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER
    gl.bindBuffer(target, buffer)
    gl.bufferData(target, bufferChunkSize, gl.STATIC_DRAW)
    buffers[key] = buffer
  })
  return buffers
}

export const uploadFullBuffers = (
  gl, keys, name, elements, bufferProps, bufferSizes, buffers, bufferSchema
) => {
  if (!keys.length) return

  // Join props of previous elements
  // prevProps: { keyA, keyB, keyC... }
  const prevProps = keys.reduce((map, key) => ({ ...map, [key]: [] }), {})
  let indexOffset = 0
  for (let i = 0; i < elements.length; i++) {
    const elementBufferProps = elements[i].bufferMap[name]
    if (!elementBufferProps) continue

    for (let j = 0; j < keys.length; j++) {
      const key = keys[j]
      if (bufferSchema[key].index) {
        const indices = []
        // elementBufferProps[key]: [0, 1, 2, 0, 1, 3...] element index array
        for (let k = 0; k < elementBufferProps[key].length; k++) {
          push(indices, elementBufferProps[key][k] + indexOffset)
        }
        prevProps[key] = prevProps[key].concat(indices)
        indexOffset = max(prevProps[key]) + 1
      } else {
        prevProps[key] = prevProps[key].concat(elementBufferProps[key])
      }
    }
  }

  // Join props of current element
  keys.forEach(key => {
    const { type, index } = bufferSchema[key]
    const target = index ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER
    let data = prevProps[key]
    if (index) {
      const indexOffset = elements.length ? max(data) + 1 : 0
      for (let i = 0; i < bufferProps[key].length; i++) {
        push(data, bufferProps[key][i] + indexOffset)
      }
    } else {
      for (let i = 0; i < bufferProps[key].length; i++) {
        push(data, bufferProps[key][i])
      }
    }
    const arr = type === BufferTypes.float
      ? new Float32Array(data)
      : new Uint16Array(data)
    gl.bindBuffer(target, buffers[key])
    gl.bufferData(target, bufferSizes[key], gl.STATIC_DRAW)
    gl.bufferData(target, arr, gl.STATIC_DRAW)
  })
}

export const uploadSubBuffers = (
  gl, keys, uploadOffset, bufferProps, buffers, bufferSchema
) => {
  if (!keys.length) return

  keys.forEach(key => {
    const { type, index } = bufferSchema[key]
    const target = index ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER

    let data
    if (index) {
      data = []
      for (let i = 0; i < bufferProps[key].length; i++) {
        data[i] = bufferProps[key][i] + uploadOffset.index
      }
    } else { data = bufferProps[key] }

    const arr = type === BufferTypes.float
      ? new Float32Array(data)
      : new Uint16Array(data)
    const size = type === BufferTypes.float ? 4 : 2
    const offset = uploadOffset.keys[key]

    gl.bindBuffer(target, buffers[key])
    gl.bufferSubData(target, offset * size, arr)
  })
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
  gl.enable(gl.DEPTH_TEST)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
}

export const draw = (
  gl, programInfo, buffers, bufferSchema, totalLength, uniformProps
) => {
  gl.useProgram(programInfo.program)

  let indexBuffer = null
  Object.keys(bufferSchema).forEach(key => {
    if (!programInfo.attributes[key] && bufferSchema[key].index) {
      indexBuffer = buffers[key]
    } else {
      const { location } = programInfo.attributes[key]
      const { type, n } = bufferSchema[key]
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers[key])
      const bufferType = type === BufferTypes.float ? gl.FLOAT : gl.INT
      gl.vertexAttribPointer(location, n, bufferType, false, 0, 0)
      gl.enableVertexAttribArray(location)
    }
  })
  indexBuffer && gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

  Object.keys(programInfo.uniforms).forEach(key => {
    const { location, type } = programInfo.uniforms[key]
    const props = uniformProps[key]
    const uniformSetterMapping = {
      [ShaderTypes.vec4]: () => gl.uniform4fv(location, props),
      [ShaderTypes.vec3]: () => gl.uniform3fv(location, props),
      [ShaderTypes.vec2]: () => gl.uniform2fv(location, props),
      [ShaderTypes.float]: () => gl.uniform1fv(location, props),
      [ShaderTypes.int]: () => gl.uniform1i(location, props),
      [ShaderTypes.mat4]: () => gl.uniformMatrix4fv(location, false, props),
      [ShaderTypes.mat3]: () => gl.uniformMatrix3fv(location, false, props),
      [ShaderTypes.mat2]: () => gl.uniformMatrix2fv(location, false, props),
      [ShaderTypes.sampler2D]: () => gl.uniform1i(location, props)
    }
    uniformSetterMapping[type]()
  })

  gl.drawElements(gl.TRIANGLES, totalLength, gl.UNSIGNED_SHORT, 0)
}
