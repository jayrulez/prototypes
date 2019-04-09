import { ImagePlugin } from './image-plugin.js'
import {
  Element,
  Renderer,
  setCamera,
  setPerspective
} from '../../src/index.js'

class ImageElement extends Element {
  constructor (state) {
    super(state)
    this.plugins = { ImagePlugin }
    this.position = state.position || [0, 0, 0]
  }
}

export const main = () => {
  const canvas = document.getElementById('gl-canvas')

  const imagePlugin = new ImagePlugin()
  const renderer = new Renderer(canvas, [imagePlugin])
  renderer.setGlobal('camera', setCamera([0, 0, 10]))
  renderer.setGlobal('perspective', setPerspective(canvas))

  const imageElement = new ImageElement({ position: [0, 0, 0] })
  renderer.addElement(imageElement)
  renderer.render()

  window.renderer = renderer
}
