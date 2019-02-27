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

export class LayerPicker {
  constructor (width, height) {
    this.hitCanvas = document.createElement('canvas')
    this.hitCanvas.width = width
    this.hitCanvas.height = height
    this.hitCtx = this.hitCanvas.getContext('2d')
    this.clipCanvas = document.createElement('canvas')
    this.clipCtx = this.clipCanvas.getContext('2d')
    this.colorMap = {}
  }

  update (layers) {
    return layers.reduce((p, layer) => p.then(() => {
      const newColor = getNewColor(this.colorMap)
      this.colorMap[newColor] = layer
      const { x, y, width, height } = layer

      if (layer.type === 'rect') {
        this.hitCtx.fillStyle = newColor
        this.hitCtx.fillRect(x, y, width, height)
        return Promise.resolve()
      } else if (layer.type === 'image') {
        this.clipCanvas.width = width
        this.clipCanvas.height = height
        this.clipCtx.save()
        this.clipCtx.drawImage(layer.$el, 0, 0, width, height)
        this.clipCtx.globalCompositeOperation = 'source-in'
        this.clipCtx.fillStyle = newColor
        this.clipCtx.fillRect(0, 0, width, height)
        this.clipCtx.restore()
        this.hitCtx.drawImage(this.clipCanvas, x, y)
        return Promise.resolve()
      }
    }), Promise.resolve())
  }

  detect (x, y) {
    const rgb = this.hitCtx.getImageData(x, y, 1, 1).data
    const hexColor = rgbToHex(rgb)
    return this.colorMap[hexColor] || null
  }
}
