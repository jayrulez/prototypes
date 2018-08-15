import { mat4 } from 'gl-matrix'

export const getMats = (w, h, rX, rY) => {
  const fov = 45 * Math.PI / 180
  const [
    aspect, zNear, zFar, projectionMat
  ] = [w / h, 0.1, 100.0, mat4.create()]
  mat4.perspective(projectionMat, fov, aspect, zNear, zFar)

  const modelViewMat = mat4.create()
  mat4.translate(modelViewMat, modelViewMat, [-0.0, 0.0, -16.0])
  mat4.rotate(modelViewMat, modelViewMat, rX / 180 * Math.PI, [1, 0, 0])
  mat4.rotate(modelViewMat, modelViewMat, rY / 180 * Math.PI, [0, 1, 0])
  return { projectionMat, modelViewMat }
}
