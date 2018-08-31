import { fabric } from 'fabric'

export const main = () => {
  const canvas1 = document.getElementById('c')
  const canvas2 = document.getElementById('b')
  const ctx = canvas1.getContext('2d')
  const ctx2 = canvas2.getContext('2d')
  ctx.imageSmoothingEnabled = false
  ctx2.imageSmoothingEnabled = false

  const canvas = new fabric.Canvas('a', {
    imageSmoothingEnabled: false,
    enableRetinaScaling: false,
    fireRightClick: true,
    stopContextMenu: true
  })
  // create a rectangle object

  const lanczosFilter = new fabric.Image.filters.Resize({
    scaleX: 1,
    scaleY: 1,
    resizeType: 'lanczos',
    lanczosLobes: 3
  })

  let oImg
  let p = { x: 0, y: 0 }

  const baseImg = document.getElementById('input')

  fabric.Image.fromURL(baseImg.src, function (img) {
    img.set({ left: 0, top: 0 }).scale(0.2)
    canvas.backgroundImage = img
  })

  fabric.Image.fromURL(baseImg.src, function (img) {
    const r = canvas.getRetinaScaling()
    oImg = img.set({ left: 400, top: 250 }).scale(0.2)
    lanczosFilter.scaleX = lanczosFilter.scaleY = oImg.scaleX * r
    oImg.lockScalingFlip = true
    oImg.minScaleLimit = 0.025
    oImg.padding = 5
    oImg.filters = [lanczosFilter]
    oImg.hoverCursor = 'crossHair'
    oImg.on('scaling', function (opt) {
      const filters = []
      const sX = Math.abs(this.scaleX) * r
      const sY = Math.abs(this.scaleY) * r
      if (sX > 0.01 && sY > 0.01 && sX < 1 && sY < 1) {
        if (sX <= 0.2 || sY <= 0.2) {
          lanczosFilter.lanczosLobes = 2
        } else if (sX <= 0.05 || sY <= 0.05) {
          lanczosFilter.lanczosLobes = 1
        } else {
          lanczosFilter.lanczosLobes = 3
        }
        lanczosFilter.scaleX = sX
        lanczosFilter.scaleY = sY
        filters.push(lanczosFilter)
      }
      this.filters = filters
    })
    oImg.on('mousedown', function (opt) {
      if (opt.button === 3) {
        p = oImg.getLocalPointer(opt.e)
        p.x /= lanczosFilter.scaleX
        p.y /= lanczosFilter.scaleY
        updateFor(lanczosFilter.scaleX, lanczosFilter.scaleY)
      }
    })
    canvas.add(oImg)
    canvas.setActiveObject(oImg)
    canvas.on('before:render', function () {
      canvas.backgroundImage.scaleX = oImg.scaleX
      canvas.backgroundImage.scaleY = oImg.scaleY
      oImg.applyFilters()
      updateFor(oImg.scaleX, oImg.scaleY)
      /*
      document.getElementById('log').innerHTML = 'scale: ' + lanczosFilter.scaleX.toFixed(4) + ' lobes: ' + lanczosFilter.lanczosLobes +
        ', taps: ' + lanczosFilter.taps.length + '\nweights:\n' + lanczosFilter.taps.map(
          function (tap, i) { return i + ': ' + tap.toFixed(7) }
        ).join('\n')
      */
    })
  })

  function updateFor (valueX, valueY) {
    const w = oImg._element.width
    const h = oImg._element.height
    const fW = Math.floor(550 * valueX)
    const fH = Math.floor(400 * valueY)
    let sx = p.x * valueX
    let sy = p.y * valueY
    if (sx + fW > w) { sx = w - fW }
    if (sy + fH > h) { sy = h - fH }
    ctx.drawImage(oImg._originalElement, sx / valueX, sy / valueY, 550, 400, 0, 0, 550 * valueX, 400 * valueY)
    ctx.drawImage(canvas1, 0, 0, fW, fH, 0, 0, 550, 400)
    ctx2.drawImage(oImg._element, sx, sy, fW, fH, 0, 0, 550, 400)
  }
}
