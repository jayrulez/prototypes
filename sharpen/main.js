/* eslint-env browser */
import fx from 'glfx'
import { main as fabricResize } from './fabric-resize'
import pica from 'pica'

const image = document.getElementById('input')
const picaOutput = document.getElementById('pica-output')
const glfxOutput = document.getElementById('glfx-output')

const glSharpen = () => {
  glfxOutput.hidden = false
  const fxCanvas = fx.canvas()
  const texture = fxCanvas.texture(image)
  if (!glfxOutput.childNodes.length) glfxOutput.appendChild(fxCanvas)
  fxCanvas.draw(texture).unsharpMask(5, 1).update()
}

const picaSharpen = () => {
  picaOutput.hidden = false
  pica().resize(image, picaOutput).then(result => console.log)
}

document.getElementById('glfx').onclick = glSharpen
document.getElementById('pica').onclick = picaSharpen
document.getElementById('fabric').onclick = fabricResize
