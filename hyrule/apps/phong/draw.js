import * as mat from '../../libs/math/matrix.js'

let ts = Date.now()
const getDelta = () => (Date.now() - ts) / 1000

const createViewMat = () => {
  const viewMat = mat.create()
  // const delta = getDelta()
  // const camera = [Math.sin(delta) * 20, Math.cos(delta) * 20, 30]
  const camera = [-10, 10, 30]
  return mat.lookAt(viewMat, camera, [0, 0, 0], [0, 1, 0])
}

const drawCube = (gl, programInfo, buffers) => {
  gl.useProgram(programInfo.program)

  const fov = Math.PI / 6
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight

  const projectionMat = mat.create()
  mat.perspective(projectionMat, fov, aspect, 0.1, 100.0)

  const modelMat = mat.create()

  const delta = getDelta()
  const posX = Math.sin(delta) * 2
  const posY = Math.cos(delta) * 2
  mat.translate(modelMat, modelMat, [posX, posY, 0])
  mat.rotate(modelMat, modelMat, posX, [1, 1, 1])

  const viewMat = createViewMat()

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

const drawLine = (gl, programInfo, buffers) => {
  gl.useProgram(programInfo.program)

  const fov = Math.PI / 6
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight

  const projectionMat = mat.create()
  mat.perspective(projectionMat, fov, aspect, 0.1, 100.0)

  const modelMat = mat.create()
  const viewMat = createViewMat()

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

export const draw = (gl, programInfos, buffers) => {
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clearDepth(1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  drawCube(gl, programInfos[0], buffers[0])
  drawLine(gl, programInfos[1], buffers[1])
}
