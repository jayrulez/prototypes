import { initProgramInfo as initCubeProgramInfo } from './program-cube.js'
import { initProgramInfo as initLineProgramInfo } from './program-line.js'
import { initBuffers as initCubeBuffers } from './buffers-cube.js'
import { initBuffers as initLineBuffers } from './buffers-line.js'
import { initDrag } from './input.js'
import { draw } from './draw.js'

const canvas = document.querySelector('#gl-canvas')

let [rX, rY] = [0, 0]
initDrag(canvas, (x, y) => { [rX, rY] = [x, y] })

const gl = canvas.getContext('webgl')
const cubeProgramInfo = initCubeProgramInfo(gl)
const lineProgramInfo = initLineProgramInfo(gl)
const cubeBuffers = initCubeBuffers(gl)
const lineBuffers = initLineBuffers(gl)

const drawFrame = () => {
  const programInfos = [cubeProgramInfo, lineProgramInfo]
  const buffers = [cubeBuffers, lineBuffers]
  draw(gl, programInfos, buffers, [rX, rY])
  window.requestAnimationFrame(drawFrame)
}
drawFrame()
