import { beforeRender, render } from './render'
import { bufferGetter } from './buffers'
import { initProgram } from './shaders'

const gl = document.querySelector('#glcanvas').getContext('webgl')
const programInfo = initProgram(gl)

const buffers = beforeRender(gl, programInfo, bufferGetter)
render(gl, programInfo, buffers)
