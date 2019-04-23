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

  const $dirX = document.getElementById('dir-x')
  const $dirY = document.getElementById('dir-y')
  const $dirZ = document.getElementById('dir-z')
  ;[$dirX, $dirY, $dirZ].forEach(input => {
    input.addEventListener('input', () => {
      const [dx, dy, dz] = [$dirX.value, $dirY.value, $dirZ.value]
      renderer.setGlobal('dirLightDirection', [dx, dy, dz])
      renderer.render()
    })
  })

  const $dirStrength = document.getElementById('dir-strength')
  $dirStrength.addEventListener('input', () => {
    renderer.setGlobal('dirLightStrength', $dirStrength.value)
    renderer.render()
  })

  window.renderer = renderer
}
