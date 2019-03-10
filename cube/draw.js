import { mat4 } from 'gl-matrix'

export const draw = (gl, programInfo, buffers) => {
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clearDepth(1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  const fov = 45 * Math.PI / 180
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight

  const projectionMat = mat4.create()
  mat4.perspective(projectionMat, fov, aspect, 0.1, 100.0)

  const modelViewMat = mat4.create()
  mat4.translate(modelViewMat, modelViewMat, [-0.0, 0.0, -20.0])

  const delta = 0
  mat4.rotate(modelViewMat, modelViewMat, delta, [1, 0, 0])

  const { vertexPos } = programInfo.attribLocations
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
  gl.vertexAttribPointer(vertexPos, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(vertexPos)

  const { vertexColor } = programInfo.attribLocations
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color)
  gl.vertexAttribPointer(vertexColor, 4, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(vertexColor)

  gl.useProgram(programInfo.program)

  const { uniformLocations } = programInfo
  gl.uniformMatrix4fv(uniformLocations.projectionMat, false, projectionMat)
  gl.uniformMatrix4fv(uniformLocations.modelViewMat, false, modelViewMat)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices)
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0)
}
