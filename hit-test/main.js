const elements = [
  { type: 'rect', name: 'a', width: 150, height: 50, x: 30, y: 0 },
  { type: 'rect', name: 'b', width: 20, height: 50, x: 100, y: 20 }
]

const getRandomColor = () => '#' + Math.random().toString(16).substr(-6)

const getNewColor = (colorMap = {}) => {
  let [max, count] = [100, 0]
  while (true) {
    const newColor = getRandomColor()
    count++
    if (!colorMap[newColor]) return newColor
    if (count > max) throw new Error('Could not generate new hit test color.')
  }
}

const rgbaToHex = ([r, g, b]) => '#' + [r, g, b].map(x => {
  const hex = x.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}).join('')

const draw = (context, elements) => {
  elements.forEach(element => {
    const newColor = getNewColor(colorMap)
    colorMap[newColor] = element

    if (element.type === 'rect') {
      context.fillStyle = newColor
      const { x, y, width, height } = element
      context.fillRect(x, y, width, height)
    }
  })
}

const $canvas = document.getElementById('canvas')
const context = $canvas.getContext('2d')
const colorMap = {}

$canvas.addEventListener('click', e => {
  const rgb = context.getImageData(e.layerX, e.layerY, 1, 1).data
  const hexColor = rgbaToHex(rgb)
  console.log(colorMap[hexColor])
})

draw(context, elements)
