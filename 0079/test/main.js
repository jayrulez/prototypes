import { Beam, Element } from './libs.js'
import { CubePlugin } from './plugins.js'

export const main = () => {
  const canvas = document.getElementById('gl-canvas')

  const cubePlugin = new CubePlugin()
  const beam = new Beam(canvas, [cubePlugin])

  const element = new Element({ position: [0, 0, 0] })
  beam.addElement(element)

  window.beam = beam
}
