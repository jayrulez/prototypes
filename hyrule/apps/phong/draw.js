import * as mat from '../../libs/math/matrix.js'

let delta = 0
const getDelta = () => { delta += 1; return delta / 60 / 3 }

const drawCube = (gl, programInfo, buffers) => {
  gl.useProgram(programInfo.program)

  const fov = Math.PI / 6
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight

  const projectionMat = mat.create()
  mat.perspective(projectionMat, fov, aspect, 0.1, 100.0)

  const modelMat = mat.create()
  mat.translate(modelMat, modelMat, [-0.0, 0.0, -15.0])

  const delta = getDelta() + Math.PI / 3
  mat.rotate(modelMat, modelMat, delta, [1, 1, 0])

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
  gl.uniformMatrix4fv(uniformLocations.projectionMat, false, projectionMat)
  gl.uniformMatrix4fv(uniformLocations.modelViewMat, false, modelMat)
  gl.uniformMatrix4fv(uniformLocations.normalMat, false, normalMat)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices)
  gl.drawElements(gl.TRIANGLES, buffers.length, gl.UNSIGNED_SHORT, 0)
}

const drawLine = (gl, programInfo, buffers) => {
  gl.useProgram(programInfo.program)

  const fov = Math.PI / 6
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight

  const projectionMat = mat.create()
  mat.perspective(projectionMat, fov, aspect, 0.1, 100.0)

  const modelMat = mat.create()
  mat.translate(modelMat, modelMat, [-0.0, 0.0, -15.0])

  const delta = getDelta() + Math.PI / 3
  mat.rotate(modelMat, modelMat, delta, [1, 1, 0])

  const { pos } = programInfo.attribLocations
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
  gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(pos)

  const { uniformLocations } = programInfo
  gl.uniformMatrix4fv(uniformLocations.projectionMat, false, projectionMat)
  gl.uniformMatrix4fv(uniformLocations.modelViewMat, false, modelMat)
  gl.uniform4fv(uniformLocations.color, [0.9, 0.9, 0.9, 1])
  gl.drawArrays(gl.LINES, 0, buffers.length / 3)
}

export const draw = (gl, programInfos, buffers) => {
  gl.clearColor(1.0, 1.0, 1.0, 1.0)
  gl.clearDepth(1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  drawCube(gl, programInfos[0], buffers[0])
  drawLine(gl, programInfos[1], buffers[1])
}
