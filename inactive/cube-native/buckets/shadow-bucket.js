import * as mat from '../matrix.js'
import { initShader } from '../helpers.js'

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
  // gl_FragColor = vec4(0, 0, 0, 0); // gl_FragColor is useless
  // gl_FragColor = vec4(rgbaDepth.rgb, 1);
  gl_FragColor = rgbaDepth;
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
  const { positions, indices } = createData()

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW
  )

  return {
    position: positionBuffer,
    indices: indexBuffer,
    length: indices.length
  }
}

// Simplified from mesh draw
export const draw = (gl, mats, programInfo, buffers, options) => {
  const { delta } = options
  gl.useProgram(programInfo.program)

  const posX = Math.sin(delta) * 2
  const posY = Math.cos(delta) * 2 - 2

  const modelMat = mat.create()
  mat.translate(modelMat, modelMat, [posX, posY, 0])
  mat.rotate(modelMat, modelMat, delta, [1, 1, 0])

  const [viewMat, projectionMat] = mats

  const { pos } = programInfo.attribLocations
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
  gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(pos)

  const { uniformLocations } = programInfo
  gl.uniformMatrix4fv(uniformLocations.modelMat, false, modelMat)
  gl.uniformMatrix4fv(uniformLocations.viewMat, false, viewMat)
  gl.uniformMatrix4fv(uniformLocations.projectionMat, false, projectionMat)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices)
  gl.drawElements(gl.TRIANGLES, buffers.length, gl.UNSIGNED_SHORT, 0)
}
