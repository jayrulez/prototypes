/* eslint-env browser */

import { Basic3DRenderer } from '../common/custom-renderers.js'
import { parseOBJ } from '../common/obj-loader.js'
import { MeshElement, MeshPlugin } from './mesh.js'
import { loadCubeMaps, loadImage, obj2BufferInfos } from './loader.js'

export const main = () => {
  const canvas = document.getElementById('gl-canvas')
  canvas.height = window.innerHeight
  canvas.width = window.innerWidth

  const meshPlugin = new MeshPlugin()
  const renderer = new Basic3DRenderer(canvas, [meshPlugin])

  renderer.setCamera([0, 400, 700], [0, 150, 0])

  const materialURL = '../common/textures/materials/'
  const urls = [
    [
      'gold/gold-scuffed-basecolor-boosted.png',
      'metal/metal-splotchy-normal.png',
      'metal/metal-splotchy-metal-roughness.png',
      'metal/metal-splotchy-emissive.png',
      'metal/metal-splotchy-metal.png' // fake AO
    ]
  ]

  Promise.all([
    fetch('../common/beam.obj').then(resp => resp.text()),
    Promise.all(urls[0].map(url => loadImage(materialURL + url))),
    loadCubeMaps('../common/textures/papermill'),
    loadImage('../common/textures/brdfLUT.png')
  ]).then(([str, images, cubeMaps, brdf]) => {
    const [model] = parseOBJ(str)
    const bufferInfos = obj2BufferInfos(model)
    const meshElement = new MeshElement({ bufferInfos, images })
    renderer.setGlobal('cubeMaps', cubeMaps)
    renderer.setGlobal('brdf', brdf)
    renderer.addElement(meshElement)
    renderer.render()
  })

  const $xRotate = document.getElementById('x-rotate')
  const $yRotate = document.getElementById('y-rotate')
  const $zRotate = document.getElementById('z-rotate')
  ;[$xRotate, $yRotate, $zRotate].forEach(input => {
    input.addEventListener('input', () => {
      const [rx, ry, rz] = [$xRotate.value, $yRotate.value, $zRotate.value]
      renderer.setGlobal('modelRotate', [rx, ry, rz])
      renderer.render()
    })
  })

  const $metallic = document.getElementById('metallic')
  $metallic.addEventListener('input', () => {
    renderer.setGlobal('metallic', $metallic.value)
    renderer.render()
  })

  const $roughness = document.getElementById('roughness')
  $roughness.addEventListener('input', () => {
    renderer.setGlobal('roughness', $roughness.value)
    renderer.render()
  })

  const $baseColorFactor = document.getElementById('base-color-factor')
  $baseColorFactor.addEventListener('input', () => {
    renderer.setGlobal('baseColorFactor', $baseColorFactor.value)
    renderer.render()
  })

  const $iblAmbient = document.getElementById('ibl-ambient')
  $iblAmbient.addEventListener('input', () => {
    renderer.setGlobal('scaleIBLAmbient', $iblAmbient.value)
    renderer.render()
  })

  const $lightRotate = document.getElementById('light-rotate')
  $lightRotate.addEventListener('input', () => {
    renderer.setGlobal('lightRotate', $lightRotate.value)
    renderer.render()
  })

  const $lightPitch = document.getElementById('light-pitch')
  $lightPitch.addEventListener('input', () => {
    renderer.setGlobal('lightPitch', $lightPitch.value)
    renderer.render()
  })

  window.renderer = renderer
}
