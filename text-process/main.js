// zLayer should be linked
import { Layer } from './node_modules/zlayer/src/index.js'
import { OutlineFilter } from './node_modules/zlayer/src/filters/index.js'
import { parseBitmap, getOutline } from './utils.js'

const drawLayer = () => {
  const textCanvas = document.getElementById('canvas-text')
  const ctx = textCanvas.getContext('2d')
  ctx.font = '50px serif'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText('1', 25, 25)
  const src = textCanvas.toDataURL()

  const layer = new Layer(document.getElementById('canvas-kernel'), {
    src, filter: OutlineFilter
  })
  window.layer = layer
  setTimeout(() => main(layer), 100)
}

const main = layer => {
  const { bitmap, width, height } = parseBitmap(layer.canvas)
  getOutline(bitmap, width, height)
}

window.onload = drawLayer
