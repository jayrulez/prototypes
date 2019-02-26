import { getRandomColor, HitTester } from './hit-test'
import brushImgSrc from './brush-test.png'

const $img = document.getElementById('img-test')
$img.onload = () => {
  const elements = [
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
  elements.forEach(element => {
    const { x, y, width, height } = element

    if (element.type === 'rect') {
      ctx.fillStyle = getRandomColor()
      ctx.fillRect(x, y, width, height)
    } else if (element.type === 'image') {
      ctx.drawImage(element.$el, x, y, width, height)
    }
  })

  const hitTester = new HitTester($canvas.width, $canvas.height)
  hitTester.update(elements)

  $canvas.addEventListener('click', (e) => {
    const result = hitTester.detect(e.layerX, e.layerY)
    console.log(result)
    document.body.appendChild(hitTester.canvas)
  })
}
$img.src = brushImgSrc
