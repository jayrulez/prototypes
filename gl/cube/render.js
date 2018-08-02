import { matGetter } from './matrix'

let delta = 0

const beforeDraw = gl => {
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clearDepth(1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
}

const draw = (gl, programInfo, mats, buffers) => {
  const { projectionMat, modelViewMat } = mats
  const { vertexPosition, vertexColor } = programInfo.attribLocations
  const { projectionMatrix, modelViewMatrix } = programInfo.uniformLocations

  {
    const numComponents = 3
    const type = gl.FLOAT
    const normalize = false
    const stride = 0
    const offset = 0
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positions)
    gl.vertexAttribPointer(
      vertexPosition, numComponents, type, normalize, stride, offset
    )
    gl.enableVertexAttribArray(vertexPosition)
  }

  {
    const numComponents = 4
    const type = gl.FLOAT
    const normalize = false
    const stride = 0
    const offset = 0
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colors)
    gl.vertexAttribPointer(
      vertexColor, numComponents, type, normalize, stride, offset
    )
    gl.enableVertexAttribArray(vertexColor)
  }

  gl.useProgram(programInfo.program)
  gl.uniformMatrix4fv(projectionMatrix, false, projectionMat)
  gl.uniformMatrix4fv(modelViewMatrix, false, modelViewMat)

  {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices)
    const offset = 0
    const type = gl.UNSIGNED_SHORT
    const vertexCount = 36
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
  }
}

const _render = (gl, programInfo, bufferGetter, delta) => {
  const mats = matGetter(gl, delta)
  beforeDraw(gl)
  draw(gl, programInfo, mats, bufferGetter(gl, -3))
  draw(gl, programInfo, mats, bufferGetter(gl, 0))
  draw(gl, programInfo, mats, bufferGetter(gl, 3))
}

export const render = (gl, programInfo, bufferGetter) => {
  window.requestAnimationFrame(() => {
    delta += 0.01
    _render(gl, programInfo, bufferGetter, delta)
    render(gl, programInfo, bufferGetter)
  })
}
