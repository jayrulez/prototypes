import * as mat from './matrix.js'
import { CAMERA_BASE } from './consts.js'

// let ts = Date.now()
// const getDelta = () => (Date.now() - ts) / 1000
const getDelta = () => 0

const createProjectionMat = (width, height) => {
  const fov = Math.PI / 6
  const aspect = width / height
  const projectionMat = mat.create()
  return mat.perspective(projectionMat, fov, aspect, 0.1, 1000.0)
}

const createViewMat = ([dX, dY]) => {
  const viewMat = mat.create()
  const [x, y, z] = CAMERA_BASE
  const camera = [-dX * 30 + x, -dY * 30 + y, z]
  return mat.lookAt(viewMat, camera, [0, 0, 0], [0, 1, 0])
}

const drawCube = (gl, mats, programInfo, buffers, delta) => {
  gl.useProgram(programInfo.program)

  const posX = Math.sin(delta) * 2
  const posY = Math.cos(delta) * 2
  const modelMat = mat.create()
  mat.translate(modelMat, modelMat, [posX, posY, 0])
  mat.rotate(modelMat, modelMat, delta, [1, 1, 0])

  const [viewMat, projectionMat] = mats

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

const drawGrid = (gl, mats, programInfo, buffers) => {
  gl.useProgram(programInfo.program)

  const modelMat = mat.create()
  const [viewMat, projectionMat] = mats

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

export const draw = (gl, programInfos, buffers, offset) => {
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clearDepth(1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  const { clientWidth, clientHeight } = gl.canvas
  const viewMat = createViewMat(offset)
  const projectionMat = createProjectionMat(clientWidth, clientHeight)
  const mats = [viewMat, projectionMat]

  const delta = getDelta()

  drawCube(gl, mats, programInfos[0], buffers[0], delta)
  drawGrid(gl, mats, programInfos[1], buffers[1])
}
