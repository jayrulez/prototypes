/* eslint-env browser */

import { Basic3DRenderer } from '../common/custom-renderers.js'
import { parseOBJ } from '../common/obj-loader.js'
import { MeshPlugin, createMeshElement } from './mesh.js'
import { loadCubeMaps, loadImage, obj2BufferInfos } from './loader.js'

export const main = () => {
  const canvas = document.getElementById('gl-canvas')
  canvas.height = window.innerHeight
  canvas.width = window.innerWidth

  const config = {
    bufferChunkSize: 1000 * 1024,
    clearColor: [0.0, 0.0, 0.0, 0.0]
  }
  const meshPlugin = new MeshPlugin()
  const renderer = new Basic3DRenderer(canvas, [meshPlugin], config)

  renderer.setCamera([0, 400, 700], [0, 150, 0])

  const materialURL = '../common/textures/materials/'

  // [Albedo, Normal, MetalRoughness, Emissive, AO]
  const urls = [
    [
      'gold/gold-scuffed-basecolor-boosted.png',
      'metal/metal-splotchy-normal.png',
      'metal/metal-splotchy-metal-roughness.png',
      'metal/metal-splotchy-emissive.png',
      'metal/metal-splotchy-metal.png' // FIXME
    ],
    [
      'chess-color.jpg',
      'metal/metal-splotchy-normal.png',
      'metal/metal-splotchy-metal-roughness.png',
      'metal/metal-splotchy-emissive.png',
      'metal/metal-splotchy-metal.png' // FIXME
    ],
    [
      'metal/metal-splotchy-albedo.png',
      'metal/metal-splotchy-normal.png',
      'metal/metal-splotchy-metal-roughness.png',
      'metal/metal-splotchy-emissive.png',
      'metal/metal-splotchy-metal.png' // FIXME
    ],
    [
      'corkboard3b/corkboard3b-albedo.png',
      'corkboard3b/corkboard3b-normal.png',
      'metal/metal-splotchy-metal-roughness.png', // FIXME
      'metal/metal-splotchy-emissive.png', // FIXME
      'corkboard3b/corkboard3b-ao.png'
    ],
    [
      'rust-coated/rust-coated-basecolor.png',
      'rust-coated/rust-coated-normal.png',
      'metal/metal-splotchy-metal-roughness.png', // FIXME
      'metal/metal-splotchy-emissive.png', // FIXME
      'metal/metal-splotchy-metal.png' // FIXME
    ]
  ]
  const urlIndex = parseInt(window.location.hash[1]) || 0 // #0, #1, #2...

  Promise.all([
    fetch('../common/beam.obj').then(resp => resp.text()),
    Promise.all(urls[urlIndex].map(url => loadImage(materialURL + url))),
    loadCubeMaps('../common/textures/papermill'),
    loadImage('../common/textures/brdfLUT.png')
  ]).then(([str, images, cubeMaps, brdf]) => {
    const [model] = parseOBJ(str)
    const bufferInfos = obj2BufferInfos(model)
    const meshElement = createMeshElement({ bufferInfos, images })
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

  for (let i = 0; i < 3; i++) {
    const $lightX = document.getElementById(`light-${i}-x`)
    $lightX.addEventListener('input', () => {
      renderer.setGlobal(`light${i}X`, $lightX.value)
      renderer.render()
    })

    const $lightY = document.getElementById(`light-${i}-y`)
    $lightY.addEventListener('input', () => {
      renderer.setGlobal(`light${i}Y`, $lightY.value)
      renderer.render()
    })

    const $lightZ = document.getElementById(`light-${i}-z`)
    $lightZ.addEventListener('input', () => {
      renderer.setGlobal(`light${i}Z`, $lightZ.value)
      renderer.render()
    })

    const $lightStrength = document.getElementById(`light-${i}-strength`)
    $lightStrength.addEventListener('input', () => {
      renderer.setGlobal(`light${i}Strength`, $lightStrength.value)
      renderer.render()
    })

    const $lightColor = document.getElementById(`light-${i}-color`)
    $lightColor.addEventListener('input', () => {
      const hex = $lightColor.value
      const rgb = [
        parseInt(hex.slice(1, 3), 16) / 256,
        parseInt(hex.slice(3, 5), 16) / 256,
        parseInt(hex.slice(5, 7), 16) / 256
      ]
      renderer.setGlobal(`light${i}Color`, rgb)
      renderer.render()
    })
  }

  window.renderer = renderer
}
