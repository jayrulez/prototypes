import * as mat from '../../utils/math/matrix.js'

export const createProjectionMat = (width, height) => {
  const fov = Math.PI / 6
  const aspect = width / height
  const projectionMat = mat.create()
  return mat.perspective(projectionMat, fov, aspect, 0.1, 1000.0)
}

export const createViewMat = (camera) => {
  const viewMat = mat.create()
  const { position, target, up } = camera
  return mat.lookAt(viewMat, position, target, up)
}

export const drawCube = (gl, mats, programInfo, buffers) => {
  gl.useProgram(programInfo.program)

  const [modelMat, viewMat, projectionMat] = mats

  const normalMat = mat.create()
  mat.invert(normalMat, modelMat)
  mat.transpose(normalMat, normalMat)

  const { pos } = programInfo.attribLocations
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
  gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(pos)

  const { vertexNormal } = programInfo.attribLocations
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal)
  gl.vertexAttribPointer(vertexNormal, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(vertexNormal)

  const { color } = programInfo.attribLocations
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color)
  gl.vertexAttribPointer(color, 4, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(color)

  const { uniformLocations } = programInfo
  gl.uniformMatrix4fv(uniformLocations.modelMat, false, modelMat)
  gl.uniformMatrix4fv(uniformLocations.viewMat, false, viewMat)
  gl.uniformMatrix4fv(uniformLocations.projectionMat, false, projectionMat)
  gl.uniformMatrix4fv(uniformLocations.normalMat, false, normalMat)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices)
  gl.drawElements(gl.TRIANGLES, buffers.length, gl.UNSIGNED_SHORT, 0)
}

export const drawGrid = (gl, mats, programInfo, buffers) => {
  gl.useProgram(programInfo.program)

  const [modelMat, viewMat, projectionMat] = mats

  const { pos } = programInfo.attribLocations
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
  gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(pos)

  const { uniformLocations } = programInfo
  gl.uniformMatrix4fv(uniformLocations.modelMat, false, modelMat)
  gl.uniformMatrix4fv(uniformLocations.viewMat, false, viewMat)
  gl.uniformMatrix4fv(uniformLocations.projectionMat, false, projectionMat)
  gl.uniform4fv(uniformLocations.color, [0.7, 0.7, 0.7, 0.8])
  gl.drawArrays(gl.LINES, 0, buffers.length / 3)
}
