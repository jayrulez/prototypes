import { CubePlugin } from './cube-plugin.js'
import {
  Element,
  Renderer,
  setCamera,
  setPerspective
} from '../../src/index.js'

class CubeElement extends Element {
  constructor (state) {
    super(state)
    this.plugins = { CubePlugin }
    this.position = state.position || [0, 0, 0]
  }
}

export const main = () => {
  const canvas = document.getElementById('gl-canvas')

  const cubePlugin = new CubePlugin()
  const renderer = new Renderer(canvas, [cubePlugin])
  renderer.setGlobal('camera', setCamera([0, 10, 10]))
  renderer.setGlobal('perspective', setPerspective(canvas))

  const cubeA = new CubeElement({ position: [0, 0, 0] })
  const cubeB = new CubeElement({ position: [3, 0, 0] })
  const cubeC = new CubeElement({ position: [-3, 0, 0] })
  const cubeD = new CubeElement({ position: [0, -3, 0] })
  renderer.addElement(cubeA)
  renderer.addElement(cubeB)
  renderer.addElement(cubeC)
  renderer.addElement(cubeD)

  renderer.render()

  window.renderer = renderer
}
