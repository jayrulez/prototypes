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

const draw = (context, colorMap = {}, elements) => {
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

export class HitTester {
  constructor (width, height) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = width
    this.canvas.height = height
    this.context = this.canvas.getContext('2d')
    this.colorMap = {}
  }

  update (elements) {
    draw(this.context, this.colorMap, elements)
  }

  detect (x, y) {
    const rgb = this.context.getImageData(x, y, 1, 1).data
    const hexColor = rgbaToHex(rgb)
    return this.colorMap[hexColor] || null
  }
}
