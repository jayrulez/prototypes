import { getMats } from './matrix'

let delta = parseFloat(window.localStorage.delta) || 0

const draw = (gl, programInfo, mats, buffer) => {
  const { projectionMat, modelViewMat } = mats
  const { vertexPosition, vertexColor } = programInfo.attribLocations
  const { projectionMatrix, modelViewMatrix } = programInfo.uniformLocations

  {
    const numComponents = 3
    const type = gl.FLOAT
    const normalize = false
    const stride = 0
    const offset = 0
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.positions)
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
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.colors)
    gl.vertexAttribPointer(
      vertexColor, numComponents, type, normalize, stride, offset
    )
    gl.enableVertexAttribArray(vertexColor)
  }

  gl.uniformMatrix4fv(projectionMatrix, false, projectionMat)
  gl.uniformMatrix4fv(modelViewMatrix, false, modelViewMat)

  {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indices)
    const offset = 0
    const type = gl.UNSIGNED_SHORT
    const vertexCount = 36
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
  }
}

export const renderFrame = (gl, programInfo, buffers, delta) => {
  const mats = getMats(gl, delta)
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clearDepth(1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  for (let i = 0; i < buffers.length; i++) {
    // TODO dynamic update buffers with extra transform.
    draw(gl, programInfo, mats, buffers[i])
  }
}

// Legacy render entry
export const render = (gl, programInfo, buffers) => {
  window.requestAnimationFrame(() => {
    delta += 0.01
    renderFrame(gl, programInfo, buffers, delta)
    if (window.localStorage._ANIMATE) render(gl, programInfo, buffers)
  })
}
