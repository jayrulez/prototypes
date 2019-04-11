import { create, lookAt, perspective } from './utils/mat4.js'

export const setCamera = (eye, center, up) => {
  const viewMat = create()
  lookAt(viewMat, eye || [0, 0, 0], center || [0, 0, 0], up || [0, 1, 0])
  return viewMat
}

export const setPerspective = (canvas) => {
  const fov = Math.PI / 6
  const aspect = canvas.clientWidth / canvas.clientHeight
  const projectionMat = create()
  perspective(projectionMat, fov, aspect, 0.1, 1000.0)
  return projectionMat
}
