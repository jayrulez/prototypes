import { draw } from './draw'
import { initBuffers } from './buffers'
import { vertexShader, fragmentShader } from './shaders'
import { initProgram } from './program'

const gl = document.querySelector('#gl-canvas').getContext('webgl')

const programInfo = initProgram(gl, vertexShader, fragmentShader)

const buffers = initBuffers(gl)

draw(gl, programInfo, buffers)
