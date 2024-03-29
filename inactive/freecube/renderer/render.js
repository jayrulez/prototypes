import { getMats } from './matrix'

const draw = (gl, programInfo, mats, buffer) => {
  const { projectionMat, modelViewMat } = mats
  const { vertexPosition, vertexColor } = programInfo.attribLocations
  const { projectionMatrix, modelViewMatrix } = programInfo.uniformLocations

  {
    const [
      numComponents, type, normalize, stride, offset
    ] = [3, gl.FLOAT, false, 0, 0]
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.positions)
    gl.vertexAttribPointer(
      vertexPosition, numComponents, type, normalize, stride, offset
    )
    gl.enableVertexAttribArray(vertexPosition)
  }

  {
    const [
      numComponents, type, normalize, stride, offset
    ] = [4, gl.FLOAT, false, 0, 0]
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
    const [offset, type, vertexCount] = [0, gl.UNSIGNED_SHORT, 36 * 27]
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
  }
}

export const renderFrame = (gl, programInfo, buffer, rX, rY) => {
  const { clientWidth, clientHeight } = gl.canvas
  const mats = getMats(clientWidth, clientHeight, rX, rY)
  gl.clearColor(0.0, 0.0, 0.0, 0.0)
  gl.clearDepth(1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  draw(gl, programInfo, mats, buffer)
}
