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

// Static demo entry
export const staticMain = () => {
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

// Animate demo entry
export const animateMain = () => {
  const canvas = document.getElementById('gl-canvas')

  const cubePlugin = new CubePlugin()
  const config = { bufferChunkSize: 1000 * 1024 }
  const renderer = new Renderer(canvas, [cubePlugin], config)
  renderer.setGlobal('camera', setCamera([0, 10, 10]))
  renderer.setGlobal('perspective', setPerspective(canvas))

  const N = 10
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      for (let k = 0; k < N; k++) {
        const cube = new CubeElement({
          position: [i * 3 - N, j * 3 - N, k * 3 - N],
          randomColor: true
        })
        renderer.addElement(cube)
      }
    }
  }

  let i = 0
  const tick = () => {
    i += 0.01
    const eye = [Math.cos(i) * 40, Math.sin(i) * 40, 40]
    renderer.setGlobal('camera', setCamera(eye))
    renderer.render()
    window.requestAnimationFrame(tick)
  }

  tick()
  window.renderer = renderer
}
