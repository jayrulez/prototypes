import { mat4 } from 'gl-matrix'

export const getMats = (gl, delta) => {
  const fov = 45 * Math.PI / 180
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
  const zNear = 0.1
  const zFar = 100.0
  const projectionMat = mat4.create()
  mat4.perspective(projectionMat, fov, aspect, zNear, zFar)

  const modelViewMat = mat4.create()
  mat4.translate(modelViewMat, modelViewMat, [-0.0, 0.0, -20.0])
  mat4.rotate(modelViewMat, modelViewMat, delta, [1, 0, 0])
  mat4.rotate(modelViewMat, modelViewMat, -delta / 2, [0, 1, 0])
  return {
    projectionMat,
    modelViewMat
  }
}
