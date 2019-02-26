export const getRandomColor = () => '#' + Math.random().toString(16).substr(-6)

const getNewColor = (colorMap = {}) => {
  let [max, count] = [100, 0]
  while (true) {
    const newColor = getRandomColor()
    count++
    if (!colorMap[newColor] && newColor !== '#ffffff') return newColor
    if (count > max) throw new Error('Could not generate new hit test color.')
  }
}

const rgbToHex = ([r, g, b]) => '#' + [r, g, b].map(x => {
  const hex = x.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}).join('')

const draw = (ctx, colorMap = {}, elements) => {
  elements.forEach(element => {
    const newColor = getNewColor(colorMap)
    colorMap[newColor] = elements
    const { x, y, width, height } = element

    if (element.type === 'rect') {
      ctx.fillStyle = newColor
      ctx.fillRect(x, y, width, height)
    } else if (element.type === 'image') {
      // TODO
    }
  })
}

export class HitTester {
  constructor (width, height) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = width
    this.canvas.height = height
    this.ctx = this.canvas.getContext('2d')
    this.colorMap = {}
  }

  update (elements) {
    draw(this.ctx, this.colorMap, elements)
  }

  detect (x, y) {
    const rgb = this.ctx.getImageData(x, y, 1, 1).data
    const hexColor = rgbToHex(rgb)
    return this.colorMap[hexColor] || null
  }
}
