/* eslint-env browser */
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

const fillClip = (clipCanvas, clipCtx, img, color, width, height) => {
  clipCanvas.width = width
  clipCanvas.height = height
  clipCtx.save()
  clipCtx.drawImage(img, 0, 0, width, height)
  clipCtx.globalCompositeOperation = 'source-in'
  clipCtx.fillStyle = color
  clipCtx.fillRect(0, 0, width, height)
  clipCtx.restore()
}

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
      const { hitCtx, clipCanvas, clipCtx } = this
      const { type, x, y, width, height } = layer

      if (type === 'rect') {
        hitCtx.fillStyle = newColor
        hitCtx.fillRect(x, y, width, height)
        return Promise.resolve()
      } else if (type === 'image') {
        fillClip(clipCanvas, clipCtx, layer.$el, newColor, width, height)
        hitCtx.drawImage(clipCanvas, x, y)
        return Promise.resolve()
      } else if (type === 'svg') {
        const str = new XMLSerializer().serializeToString(layer.$el)
        const img = new Image()

        return new Promise((resolve, reject) => {
          img.onload = () => {
            fillClip(clipCanvas, clipCtx, img, newColor, width, height)
            hitCtx.drawImage(clipCanvas, x, y)
            resolve()
          }
          const prefix = 'data:image/svg+xml; charset=utf8, '
          img.src = prefix + encodeURIComponent(str)
        })
      }
    }), Promise.resolve())
  }

  pick (x, y) {
    const rgb = this.hitCtx.getImageData(x, y, 1, 1).data
    const hexColor = rgbToHex(rgb)
    return this.colorMap[hexColor] || null
  }
}
