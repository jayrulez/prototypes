/* eslint-env browser */

import { Basic3DRenderer } from '../common/custom-renderers.js'
import { parseOBJ } from '../common/obj-loader.js'
import { MeshPlugin, createMeshElement } from './text.js'

export const main = () => {
  const canvas = document.getElementById('gl-canvas')
  canvas.height = window.innerHeight
  canvas.width = window.innerWidth

  const meshPlugin = new MeshPlugin()
  const renderer = new Basic3DRenderer(canvas, [meshPlugin])
  renderer.setCamera([0, 400, 700], [0, 150, 0])

  fetch('../common/beam.obj').then(resp => resp.text()).then(str => {
    const [model] = parseOBJ(str)
    const element = createMeshElement(model)
    renderer.addElement(element)
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

  const $dirColor = document.getElementById('dir-color')
  $dirColor.addEventListener('input', () => {
    const hex = $dirColor.value
    const rgb = [
      parseInt(hex.slice(1, 3), 16) / 256,
      parseInt(hex.slice(3, 5), 16) / 256,
      parseInt(hex.slice(5, 7), 16) / 256
    ]
    renderer.setGlobal('dirLightColor', rgb)
    renderer.render()
  })

  window.renderer = renderer
}
