import { render } from './render'
import { bufferGetter } from './buffers'
import { initProgram } from './shaders'

const gl = document.querySelector('#glcanvas').getContext('webgl')
const programInfo = initProgram(gl)

render(gl, programInfo, bufferGetter)
