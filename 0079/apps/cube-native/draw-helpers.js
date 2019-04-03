import * as mat from './matrix.js'
import { ANIMATE, CAMERA_BASE, ROTATE_DELTA_BASE } from './consts.js'

let ts = Date.now()
export const getDelta = () => ANIMATE
  ? (Date.now() - ts) / 1000 : ROTATE_DELTA_BASE

export const createProjectionMat = (width, height) => {
  const fov = Math.PI / 6
  const aspect = width / height
  const projectionMat = mat.create()
  return mat.perspective(projectionMat, fov, aspect, 0.1, 1000.0)
}

export const getCamera = (dX, dY) => {
  const [x, y, z] = CAMERA_BASE
  return [-dX * 30 + x, -dY * 30 + y, z]
}

export const createViewMat = ([dX, dY]) => {
  const viewMat = mat.create()
  const camera = getCamera(dX, dY)
  return mat.lookAt(viewMat, camera, [0, 0, 0], [0, 1, 0])
}
