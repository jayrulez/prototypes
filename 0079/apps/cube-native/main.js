import { ANIMATE } from './consts.js'
import * as meshBucket from './buckets/mesh-bucket.js'
import * as lineBucket from './buckets/line-bucket.js'
import * as shadowBucket from './buckets/shadow-bucket.js'
import { createLineData, createTriangleData } from './data.js'
import {
  createViewMat, createProjectionMat, getDelta, getCamera, initDrag
} from './helpers.js'

const canvas = document.querySelector('#gl-canvas')

let [rX, rY] = [0, 0]
initDrag(canvas, (x, y) => {
  [rX, rY] = [x, y]
  !ANIMATE && drawFrame()
})

const gl = canvas.getContext('webgl')

// const triangleProgramInfo = meshBucket.initProgramInfo(gl)
const triangleBuffers = meshBucket.initBuffers(gl, createTriangleData)

const lineProgramInfo = lineBucket.initProgramInfo(gl)
const lineBuffers = lineBucket.initBuffers(gl, createLineData)

const shadowProgramInfo = shadowBucket.initProgramInfo(gl)
// const shadowBuffers = shadowBucket.initBuffers(gl, createTriangleData)

const draw = (gl, offset) => {
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clearDepth(1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  const { clientWidth, clientHeight } = gl.canvas
  const viewMat = createViewMat(offset)
  const projectionMat = createProjectionMat(clientWidth, clientHeight)
  const mats = [viewMat, projectionMat]

  const delta = getDelta()
  const camera = getCamera(offset[0], offset[1])
  const options = { delta, camera }

  // meshBucket.draw(gl, mats, triangleProgramInfo, triangleBuffers, options)
  meshBucket.draw(gl, mats, shadowProgramInfo, triangleBuffers, options)
  lineBucket.draw(gl, mats, lineProgramInfo, lineBuffers)
}

const drawFrame = () => {
  draw(gl, [rX, rY])
  ANIMATE && window.requestAnimationFrame(drawFrame)
}
drawFrame()
