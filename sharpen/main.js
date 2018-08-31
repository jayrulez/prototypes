/* eslint-env browser */
import fx from 'glfx'
import { main as fabricSharpen } from './fabric-sharpen'
import pica from 'pica'

const image = document.getElementById('input')
const picaOutput = document.getElementById('pica-output')
const glfxOutput = document.getElementById('glfx-output')

const glSharpen = () => {
  const fxCanvas = fx.canvas()
  const texture = fxCanvas.texture(image)
  if (!glfxOutput.childNodes.length) glfxOutput.appendChild(fxCanvas)
  fxCanvas.draw(texture).unsharpMask(5, 1).update()
}

const picaSharpen = () => {
  pica().resize(image, picaOutput).then(result => console.log)
}

document.getElementById('glfx').onclick = glSharpen
document.getElementById('pica').onclick = picaSharpen
document.getElementById('fabric').onclick = fabricSharpen
