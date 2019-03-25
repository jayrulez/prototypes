import { initProgramInfo as initCubeProgramInfo } from './program-cube.js'
import { initProgramInfo as initLineProgramInfo } from './program-line.js'
import { initBuffers as initCubeBuffers } from './buffers-cube.js'
import { initBuffers as initLineBuffers } from './buffers-line.js'
import { draw } from './draw.js'

const gl = document.querySelector('#gl-canvas').getContext('webgl')

const cubeProgramInfo = initCubeProgramInfo(gl)
const lineProgramInfo = initLineProgramInfo(gl)
const cubeBuffers = initCubeBuffers(gl)
const lineBuffers = initLineBuffers(gl)

const drawFrame = () => {
  draw(gl, [cubeProgramInfo, lineProgramInfo], [cubeBuffers, lineBuffers])
  window.requestAnimationFrame(drawFrame)
}
drawFrame()
