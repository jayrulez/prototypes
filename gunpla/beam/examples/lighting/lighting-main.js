/* eslint-env browser */

import { Basic3DRenderer } from '../common/custom-renderers.js'
import { parseOBJ } from '../common/obj-loader.js'
import { TextPlugin, createTextElement } from './text.js'

export const main = () => {
  const canvas = document.getElementById('gl-canvas')
  canvas.height = window.innerHeight
  canvas.width = window.innerWidth

  const textPlugin = new TextPlugin()
  const renderer = new Basic3DRenderer(canvas, [textPlugin])
  renderer.setCamera([0, 400, 700], [0, 150, 0])

  fetch('../common/beam.obj').then(resp => resp.text()).then(str => {
    const [model] = parseOBJ(str)
    const textElement = createTextElement(model)
    renderer.addElement(textElement)
    renderer.render()
  })

  window.renderer = renderer
}
