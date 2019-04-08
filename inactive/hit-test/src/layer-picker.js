/* eslint-env browser */
import { getNewColor, rgbToHex, fillClip, transformLayer } from './utils'

export class LayerPicker {
  constructor () {
    this.hitCanvas = document.createElement('canvas')
    this.hitCtx = this.hitCanvas.getContext('2d')
    this.clipCanvas = document.createElement('canvas')
    this.clipCtx = this.clipCanvas.getContext('2d')
    this.colorMap = {}
  }

  update (layers, width, height) {
    this.hitCanvas.width = width
    this.hitCanvas.height = height

    return layers.reduce((p, layer) => p.then(() => {
      const newColor = getNewColor(this.colorMap)
      this.colorMap[newColor] = layer
      const { hitCtx, clipCanvas, clipCtx } = this
      const { type, x, y, width, height, transform } = layer

      if (type === 'rect') {
        transformLayer(hitCtx, transform, x, y, width, height)
        hitCtx.fillStyle = newColor
        hitCtx.fillRect(x, y, width, height)
        hitCtx.restore()
        return Promise.resolve()
      } else if (type === 'image') {
        transformLayer(hitCtx, transform, x, y, width, height)
        fillClip(clipCanvas, clipCtx, layer.$el, newColor, width, height)
        hitCtx.drawImage(clipCanvas, x, y)
        hitCtx.restore()
        return Promise.resolve()
      } else if (type === 'svg') {
        const str = new XMLSerializer().serializeToString(layer.$el)
        const img = new Image()

        return new Promise((resolve, reject) => {
          img.onload = () => {
            transformLayer(hitCtx, transform, x, y, width, height)
            fillClip(clipCanvas, clipCtx, img, newColor, width, height)
            hitCtx.drawImage(clipCanvas, x, y)
            hitCtx.restore()
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
