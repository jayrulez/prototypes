import { HitTester } from './hit-test'

const elements = [
  { type: 'rect', name: 'a', width: 150, height: 50, x: 30, y: 0 },
  { type: 'rect', name: 'b', width: 20, height: 50, x: 100, y: 20 }
]

const $canvas = document.getElementById('canvas')
const context = $canvas.getContext('2d')
elements.forEach(element => {
  if (element.type === 'rect') {
    context.fillStyle = 'black'
    const { x, y, width, height } = element
    context.fillRect(x, y, width, height)
  }
})

const hitTester = new HitTester($canvas.width, $canvas.height)
hitTester.update(elements)

$canvas.addEventListener('click', (e) => {
  const result = hitTester.detect(e.layerX, e.layerY)
  console.log(result)
})
