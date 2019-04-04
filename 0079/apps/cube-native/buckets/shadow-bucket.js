import * as mat from '../matrix.js'
import { initShader, initFramebufferObject } from '../helpers.js'
import { OFFSCREEN_SIZE, LIGHT_POS } from '../consts.js'

const vertexShader = `
precision highp float;

attribute vec4 pos;

uniform mat4 modelMat;
uniform mat4 viewMat;
uniform mat4 projectionMat;

void main() {
  gl_Position = projectionMat * viewMat * modelMat * pos;
}
`

const fragmentShader = `
precision highp float;

void main() {
  const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
  const vec4 bitMask = vec4(1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0, 0.0);
  vec4 rgbaDepth = fract(gl_FragCoord.z * bitShift);
  rgbaDepth -= rgbaDepth.gbaa * bitMask;
  // gl_FragColor = rgbaDepth;
  gl_FragColor = vec4(rgbaDepth.rgb, 1);
}
`

export const initProgramInfo = gl => {
  const program = initShader(gl, vertexShader, fragmentShader)
  return {
    program,
    attribLocations: {
      pos: gl.getAttribLocation(program, 'pos')
    },
    uniformLocations: {
      modelMat: gl.getUniformLocation(program, 'modelMat'),
      viewMat: gl.getUniformLocation(program, 'viewMat'),
      projectionMat: gl.getUniformLocation(program, 'projectionMat')
    }
  }
}

export const initBuffers = (gl, createData) => {
  const { positions, colors, indices, normals } = createData()

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  const colorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)

  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW
  )

  const normalBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW)

  return {
    normal: normalBuffer,
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
    length: indices.length
  }
}

export const draw = (gl, mats, initProgramInfo, buffers) => {
  const fbo = initFramebufferObject(gl)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, fbo.texture)

  gl.clearColor(0, 0, 0, 1)
  gl.enable(gl.DEPTH_TEST)

  const lightViewProjectionMat = mat.create()
  const fov = Math.PI / 6
  mat.perspective(lightViewProjectionMat, fov, 1.0, 1.0, 200.0)
  mat.lookAt(lightViewProjectionMat, LIGHT_POS, [0, 0, 0], [0, 1, 0])
  // viewMat.lookAt(camera)

  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.viewport(0, 0, OFFSCREEN_SIZE, OFFSCREEN_SIZE)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // TODO draw FBO
}
