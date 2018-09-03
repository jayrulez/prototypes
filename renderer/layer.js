import { initProgram } from './shaders'
import { initBuffers } from './buffers'
import { render } from './render'

export class Layer {
  constructor (canvas) {
    this.canvas = canvas
    this.gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })
    this.programInfo = initProgram(this.gl)
    this.buffers = initBuffers(this.gl)
  }

  render () {
    render(this.gl, this.canvas, this.programInfo, this.buffers)
  }
}
