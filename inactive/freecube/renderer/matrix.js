import { create, perspective, translate, rotate } from './math'

export const getMats = (w, h, rX, rY) => {
  const fov = 30 * Math.PI / 180
  const [
    aspect, zNear, zFar, projectionMat
  ] = [w / h, 0.1, 100.0, create()]
  perspective(projectionMat, fov, aspect, zNear, zFar)

  const modelViewMat = create()
  translate(modelViewMat, modelViewMat, [-0.0, 0.0, -25.0])
  rotate(modelViewMat, modelViewMat, rX / 180 * Math.PI, [1, 0, 0])
  rotate(modelViewMat, modelViewMat, rY / 180 * Math.PI, [0, 1, 0])
  return { projectionMat, modelViewMat }
}
