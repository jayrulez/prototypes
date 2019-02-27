/* eslint-env browser */
import { getRandomColor, LayerPicker } from './hit-test'
import brushImgSrc from './brush-test.png'

const $img = document.getElementById('img-test')
$img.src = brushImgSrc
$img.onload = () => {
  const layers = [
    { type: 'rect', name: 'rect-a', width: 150, height: 50, x: 30, y: 0 },
    { type: 'rect', name: 'rect-b', width: 60, height: 80, x: 100, y: 20 },
    {
      type: 'image',
      name: 'brush',
      width: $img.naturalWidth,
      height: $img.naturalHeight,
      x: 0,
      y: 0,
      $el: $img
    },
    {
      type: 'image',
      name: 'brush-2',
      width: $img.naturalWidth,
      height: $img.naturalHeight,
      x: 100,
      y: 100,
      $el: $img
    },
    {
      type: 'svg',
      name: 'vector',
      width: 575 / 5,
      height: 250 / 5,
      x: 200,
      y: 40,
      $el: document.getElementById('svg-test')
    }
  ]
  const $canvas = document.getElementById('canvas')
  const ctx = $canvas.getContext('2d')

  layers.reduce((p, layer) => p.then(() => {
    const { type, x, y, width, height } = layer
    if (type === 'rect') {
      ctx.fillStyle = getRandomColor()
      ctx.fillRect(x, y, width, height)
      return Promise.resolve()
    } else if (type === 'image') {
      ctx.drawImage(layer.$el, x, y, width, height)
      return Promise.resolve()
    } else if (type === 'svg') {
      const str = new XMLSerializer().serializeToString(layer.$el)
      const img = new Image()
      return new Promise((resolve, reject) => {
        img.onload = () => {
          ctx.drawImage(img, x, y, width, height)
          resolve()
        }
        img.src = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent(str)
      })
    }
  }), Promise.resolve())

  const picker = new LayerPicker($canvas.width, $canvas.height)
  picker.update(layers)

  $canvas.addEventListener('click', (e) => {
    const result = picker.detect(e.layerX, e.layerY)
    console.log(result)
    document.body.appendChild(picker.hitCanvas)
    // document.body.appendChild(picker.clipCanvas)
  })
}
