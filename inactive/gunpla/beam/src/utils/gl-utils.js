// Include all gl-related methods here

import { ShaderTypes } from '../consts.js'
import {
  concat,
  isPowerOf2,
  getBufferKeys,
  bufferPropOffset,
  mapValue
} from '../utils/misc.js'

// TODO per plugin
const extensions = {}

export const getWebGLInstance = canvas => {
  const gl = canvas.getContext('webgl')
  // TODO extension detect
  extensions.EXT_shader_texture_lod = gl.getExtension('EXT_shader_texture_lod')
  extensions.OES_standard_derivatives = gl.getExtension(
    'OES_standard_derivatives'
  )
  extensions.EXT_SRGB = gl.getExtension('EXT_SRGB')
  return gl
}

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

const initShader = (gl, vs, fs) => {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vs)
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fs)

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

export const initProgramInfo = (gl, shaderSchema, vs, fs) => {
  const program = initShader(gl, vs, fs)
  // map from { normal: 0, position: 1, uv: 2 }
  // to { normal: { type, location } }
  const attributes = mapValue(shaderSchema.attributes, (attributes, key) => ({
    type: attributes[key],
    location: gl.getAttribLocation(program, key)
  }))
  const uniforms = mapValue(shaderSchema.uniforms, (uniforms, key) => ({
    type: uniforms[key],
    location: gl.getUniformLocation(program, key)
  }))

  return { program, attributes, uniforms }
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

export const uploadFullBuffers = (gl, plugin, bufferKeys, elements) => {
  if (!bufferKeys.length) return

  const { buffers, bufferSizes, propSchema } = plugin
  const { name } = plugin.constructor
  // Join props of elements
  // props: { keyA, keyB, keyC... }
  const props = bufferKeys.reduce((map, key) => ({ ...map, [key]: [] }), {})
  for (let i = 0; i < elements.length; i++) {
    const elementBufferProps = elements[i].bufferPropsMap[name]
    if (!elementBufferProps) continue

    for (let j = 0; j < bufferKeys.length; j++) {
      const key = bufferKeys[j]
      concat(props[key], elementBufferProps[key])
    }
  }

  bufferKeys.forEach(key => {
    const { index } = propSchema[key]
    if (index) return

    const data = props[key]
    const arr = new Float32Array(data)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[key])
    gl.bufferData(gl.ARRAY_BUFFER, bufferSizes[key], gl.STATIC_DRAW)
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW)
  })
}

export const uploadSubBuffers = (
  gl, plugin, bufferProps, bufferKeys, elements
) => {
  const { buffers, propSchema } = plugin
  const { name } = plugin.constructor
  bufferKeys.forEach(key => {
    const { index } = propSchema[key]
    if (index) return

    const data = bufferProps[key]
    const arr = new Float32Array(data)
    const size = index ? 2 : 4
    const commonOffset = bufferPropOffset(elements, name, key)

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[key])
    gl.bufferSubData(gl.ARRAY_BUFFER, commonOffset * size, arr)
  })
}

const upload2DTexture = (gl, image, schemaValue) => {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)

  if (schemaValue.flip) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

  const space = gl.RGBA
  gl.texImage2D(gl.TEXTURE_2D, 0, space, space, gl.UNSIGNED_BYTE, image)

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

const uploadCubeTexture = (gl, cubeMap, schemaValue) => {
  const { unit = 0 } = schemaValue
  const { level, images } = cubeMap
  const faces = [
    gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
  ]
  const texture = gl.createTexture()
  gl.activeTexture(gl.TEXTURE0 + unit)
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  if (level < 2) {
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  } else {
    gl.texParameteri(
      gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR
    )
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)

  let count = 0
  for (let i = 0; i < faces.length; i++) {
    for (let j = 0; j <= level; j++) {
      const face = faces[i]
      // TODO SRGB_EXT detect
      const space = extensions.EXT_SRGB.SRGB_EXT
      gl.texImage2D(face, j, space, space, gl.UNSIGNED_BYTE, images[count])
      count++
    }
  }

  return texture
}

export const uploadTexture = (gl, imageLike, schemaValue) => {
  return schemaValue.cube
    ? uploadCubeTexture(gl, imageLike, schemaValue)
    : upload2DTexture(gl, imageLike, schemaValue)
}

export const clearBuffers = (gl, plugin) => {
  const { bufferSizes, buffers, propSchema } = plugin
  const bufferKeys = getBufferKeys(propSchema)
  bufferKeys.forEach(key => {
    const { index } = propSchema[key]
    const target = index ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER

    gl.bindBuffer(target, buffers[key])
    gl.bufferData(target, bufferSizes[key], gl.STATIC_DRAW)
  })
}

export const resetBeforeDraw = (gl, clearColor) => {
  const [r, g, b, a] = clearColor
  gl.clearColor(r, g, b, a)
  gl.clearDepth(1.0)
  gl.disable(gl.BLEND)
  gl.enable(gl.DEPTH_TEST)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
}

const uploadIndexBuffer = (gl, plugin, i) => {
  const { buffers, propSchema, indexPropsGroups } = plugin
  const indexBufferGroup = indexPropsGroups[i]
  const bufferKeys = getBufferKeys(propSchema)
  const indexKey = bufferKeys.find(key => propSchema[key].index)
  const data = indexBufferGroup
  const arr = new Uint16Array(data)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[indexKey])
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arr, gl.STATIC_DRAW)
}

const draw = (gl, plugin, props, count, texLoaded) => {
  const { programInfo, propSchema, buffers, textureMap } = plugin
  const bufferKeys = getBufferKeys(propSchema)

  gl.useProgram(programInfo.program)
  let indexBuffer = null
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
      [ShaderTypes.mat4]: () => gl.uniformMatrix4fv(location, false, prop),
      [ShaderTypes.mat3]: () => gl.uniformMatrix3fv(location, false, prop),
      [ShaderTypes.mat2]: () => gl.uniformMatrix2fv(location, false, prop),
      [ShaderTypes.sampler2D]: () => {
        const { unit = 0 } = propSchema[key]
        gl.uniform1i(location, unit)
        gl.activeTexture(gl.TEXTURE0 + unit)
        gl.bindTexture(gl.TEXTURE_2D, textureMap.get(prop))
        if (texLoaded) return
        gl.texImage2D(
          gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, prop
        )
      },
      [ShaderTypes.samplerCube]: () => {
        if (texLoaded) return
        const { unit = 0 } = propSchema[key]
        const faces = [
          gl.TEXTURE_CUBE_MAP_POSITIVE_X,
          gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
          gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
          gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
          gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
          gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ]
        const { images, level } = prop
        const space = extensions.EXT_SRGB.SRGB_EXT

        gl.uniform1i(location, unit)
        gl.activeTexture(gl.TEXTURE0 + unit)

        let count = 0
        for (let i = 0; i < faces.length; i++) {
          for (let j = 0; j <= level; j++) {
            const face = faces[i]
            // TODO SRGB_EXT detect
            gl.texImage2D(
              face, j, space, space, gl.UNSIGNED_BYTE, images[count]
            )
            count++
          }
        }
      }
    }
    uniformSetterMapping[type]()
  })

  gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0)
}

export const drawByGroup = (gl, plugin, elementsGroup, globals, texLoaded) => {
  const { propSchema } = plugin
  const { name } = plugin.constructor
  const indexKey = Object
    .keys(propSchema)
    .find(key => propSchema[key].index)
  for (let i = 0; i < elementsGroup.length; i++) {
    const elements = elementsGroup[i]
    uploadIndexBuffer(gl, plugin, i)

    let count = 0
    for (let i = 0; i < elements.length; i++) {
      const indexProp = elements[i].bufferPropsMap[name][indexKey]
      count += indexProp.length
    }
    const props = {
      // Should always has length, always same element props in same batch
      ...plugin.propsByElement(elements[0]),
      ...plugin.propsByGlobals(globals)
    }
    draw(gl, plugin, props, count, texLoaded)
  }
}
