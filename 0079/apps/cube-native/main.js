import * as mat from './matrix.js'
import { ANIMATE, LIGHT_POS, OFFSCREEN_SIZE } from './consts.js'
import * as meshBucket from './buckets/mesh-bucket.js'
import * as lineBucket from './buckets/line-bucket.js'
import * as shadowBucket from './buckets/shadow-bucket.js'
import { createLineData, createTriangleData } from './data.js'
import {
  createViewMat,
  createProjectionMat,
  getDelta,
  getCamera,
  initDrag,
  initFramebufferObject
} from './helpers.js'

const canvas = document.querySelector('#gl-canvas')

let [rX, rY] = [0, 0]
initDrag(canvas, (x, y) => {
  [rX, rY] = [x, y]
  !ANIMATE && drawFrame()
})

const gl = canvas.getContext('webgl')

const triangleProgramInfo = meshBucket.initProgramInfo(gl)
const triangleBuffers = meshBucket.initBuffers(gl, createTriangleData)

const lineProgramInfo = lineBucket.initProgramInfo(gl)
const lineBuffers = lineBucket.initBuffers(gl, createLineData)

const shadowProgramInfo = shadowBucket.initProgramInfo(gl)
const shadowBuffers = shadowBucket.initBuffers(gl, createTriangleData)
const fboData = initFramebufferObject(gl)

const draw = (gl, offset) => {
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clearDepth(1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  const { clientWidth, clientHeight } = gl.canvas
  const viewMat = createViewMat(offset)
  const projectionMat = createProjectionMat(clientWidth, clientHeight)

  const delta = getDelta()
  const camera = getCamera(offset[0], offset[1])
  const options = { delta, camera }

  // Shadow pass begins
  const { framebuffer, texture } = fboData
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.clearColor(0, 0, 0, 1)
  gl.enable(gl.DEPTH_TEST)

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.viewport(0, 0, OFFSCREEN_SIZE, OFFSCREEN_SIZE)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  const lightViewMat = mat.create()
  const lightProjectionMat = mat.create()
  const fov = Math.PI / 6
  mat.perspective(lightViewMat, fov, 1.0, 1.0, 100.0) // Changing this works
  mat.lookAt(lightProjectionMat, LIGHT_POS, [0, 0, 0], [0, 1, 0])
  const lightMats = [lightViewMat, lightProjectionMat]
  shadowBucket.draw(gl, lightMats, shadowProgramInfo, shadowBuffers, options)

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.viewport(0, 0, clientWidth, clientHeight)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  // Shadow pass ends

  const mats = [viewMat, projectionMat, lightViewMat, lightProjectionMat]

  meshBucket.draw(gl, mats, triangleProgramInfo, triangleBuffers, options)
  lineBucket.draw(gl, mats, lineProgramInfo, lineBuffers)
}

const drawFrame = () => {
  draw(gl, [rX, rY])
  ANIMATE && window.requestAnimationFrame(drawFrame)
}
drawFrame()
