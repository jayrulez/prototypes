import { render } from './render'
import { initBuffers } from './buffers'
import { initProgram } from './shaders'

const gl = document.querySelector('#glcanvas').getContext('webgl')
const programInfo = initProgram(gl)
const buffers = initBuffers(gl)

render(gl, programInfo, buffers)
