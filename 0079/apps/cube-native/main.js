import { ANIMATE } from './consts.js'
import * as trianglePass from './triangle-pass/triangle-pass.js'
import * as linePass from './line-pass/line-pass.js'
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
const triangleProgramInfo = trianglePass.initProgramInfo(gl)
const lineProgramInfo = linePass.initProgramInfo(gl)
const triangleBuffers = trianglePass.initBuffers(gl)
const lineBuffers = linePass.initBuffers(gl)

const draw = (gl, programInfos, buffers, offset) => {
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

  trianglePass.draw(gl, mats, programInfos[0], buffers[0], delta, camera)
  linePass.draw(gl, mats, programInfos[1], buffers[1])
}

const drawFrame = () => {
  const programInfos = [triangleProgramInfo, lineProgramInfo]
  const buffers = [triangleBuffers, lineBuffers]
  draw(gl, programInfos, buffers, [rX, rY])
  ANIMATE && window.requestAnimationFrame(drawFrame)
}
drawFrame()
