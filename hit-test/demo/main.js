/* eslint-env browser */

import { LayerPicker } from '../src/layer-picker'
import { getRandomColor, transformLayer } from '../src/utils'
import alphaImgSrc from './alpha-test.png'

const $img = document.getElementById('img-test')
$img.src = alphaImgSrc
$img.onload = () => {
  const layers = [
    { type: 'rect', name: 'rect-a', width: 150, height: 50, x: 30, y: 0 },
    {
      type: 'rect',
      name: 'rect-b',
      width: 60,
      height: 40,
      x: 50,
      y: 30,
      // rotate 45 degree
      transform: {
        a: 0.7071067811865476,
        b: 0.7071067811865475,
        c: -0.7071067811865475,
        d: 0.7071067811865476,
        tx: 0,
        ty: 0
      }
    },
    {
      type: 'image',
      name: 'image-1',
      width: $img.naturalWidth,
      height: $img.naturalHeight,
      x: 0,
      y: 0,
      $el: $img
    },
    {
      type: 'image',
      name: 'image-2',
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
    const { type, x, y, width, height, transform } = layer
    if (type === 'rect') {
      transformLayer(ctx, transform, x, y, width, height)
      ctx.fillStyle = getRandomColor()
      ctx.fillRect(x, y, width, height)
      ctx.restore()
      return Promise.resolve()
    } else if (type === 'image') {
      transformLayer(ctx, transform, x, y, width, height)
      ctx.drawImage(layer.$el, x, y, width, height)
      ctx.restore()
      return Promise.resolve()
    } else if (type === 'svg') {
      const str = new XMLSerializer().serializeToString(layer.$el)
      const img = new Image()
      return new Promise((resolve, reject) => {
        img.onload = () => {
          transformLayer(ctx, transform, x, y, width, height)
          ctx.drawImage(img, x, y, width, height)
          ctx.restore()
          resolve()
        }
        img.src = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent(str)
      })
    }
  }), Promise.resolve())

  const picker = new LayerPicker()
  window.picker = picker
  console.time('updateLayers')
  picker.update(layers, $canvas.width, $canvas.height).then(() => {
    console.timeEnd('updateLayers')
  })

  $canvas.addEventListener('click', e => {
    const result = picker.pick(e.layerX, e.layerY)
    console.log(e.layerX, e.layerY, result)
    document.body.appendChild(picker.hitCanvas)
    // document.body.appendChild(picker.clipCanvas)
  })
}
