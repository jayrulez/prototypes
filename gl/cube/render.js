/* eslint-env browser */
import { mat4 } from 'gl-matrix'

let delta = 0

export function render (gl, programInfo, buffers) {
  requestAnimationFrame(() => {
    delta += 0.01
    renderFrame(gl, programInfo, buffers, delta)
    render(gl, programInfo, buffers)
  })
}

function renderFrame (gl, programInfo, buffers, delta) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clearDepth(1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  const fieldOfView = 45 * Math.PI / 180
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
  const zNear = 0.1
  const zFar = 100.0
  const projectionMatrix = mat4.create()

  mat4.perspective(
    projectionMatrix,
    fieldOfView,
    aspect,
    zNear,
    zFar
  )

  const modelViewMatrix = mat4.create()
  mat4.translate(
    modelViewMatrix,
    modelViewMatrix,
    [-0.0, 0.0, -20.0]
  )

  mat4.rotate(
    modelViewMatrix,
    modelViewMatrix,
    delta,
    [1, 0, 0]
  )

  {
    const numComponents = 3
    const type = gl.FLOAT
    const normalize = false
    const stride = 0
    const offset = 0
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    )
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
  }

  {
    const numComponents = 4
    const type = gl.FLOAT
    const normalize = false
    const stride = 0
    const offset = 0
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color)
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexColor,
      numComponents,
      type,
      normalize,
      stride,
      offset
    )
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor)
  }

  gl.useProgram(programInfo.program)

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  )
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  )

  {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices)
    const offset = 0
    const type = gl.UNSIGNED_SHORT
    const vertexCount = 36
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
  }
}
