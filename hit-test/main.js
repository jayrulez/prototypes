import { getRandomColor, LayerPicker } from './hit-test'
import brushImgSrc from './brush-test.png'

const $img = document.getElementById('img-test')
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
    }
  ]

  const $canvas = document.getElementById('canvas')
  const ctx = $canvas.getContext('2d')
  layers.forEach(layer => {
    const { x, y, width, height } = layer

    if (layer.type === 'rect') {
      ctx.fillStyle = getRandomColor()
      ctx.fillRect(x, y, width, height)
    } else if (layer.type === 'image') {
      ctx.drawImage(layer.$el, x, y, width, height)
    }
  })

  const picker = new LayerPicker($canvas.width, $canvas.height)
  picker.update(layers)

  $canvas.addEventListener('click', (e) => {
    const result = picker.detect(e.layerX, e.layerY)
    console.log(result)
    document.body.appendChild(picker.hitCanvas)
    document.body.appendChild(picker.clipCanvas)
  })
}
$img.src = brushImgSrc
