import { create, lookAt, perspective } from './mat4.js'
import { Renderer } from '../../src/renderer.js'

export class Basic3DRenderer extends Renderer {
  constructor (...args) {
    super(...args)
    this.setCamera()
    this.setPerspective()
  }

  setCamera (eye = [0, 0, 0], center = [0, 0, 0], up = [0, 1, 0]) {
    const viewMat = create()
    lookAt(viewMat, eye, center, up)
    this.setGlobal('camera', viewMat)
  }

  setPerspective (fov = Math.PI / 6, zNear = 0.1, zFar = 1000.0) {
    const { canvas } = this.gl
    const aspect = canvas.clientWidth / canvas.clientHeight
    const projectionMat = create()
    perspective(projectionMat, fov, aspect, zNear, zFar)
    this.setGlobal('perspective', projectionMat)
  }
}
