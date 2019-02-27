export const getRandomColor = () => '#' + Math.random().toString(16).substr(-6)

export const getNewColor = (colorMap = {}) => {
  let [max, count] = [100, 0]
  while (true) {
    const newColor = getRandomColor()
    count++
    if (!colorMap[newColor] && newColor !== '#ffffff') return newColor
    if (count > max) throw new Error('Could not generate new hit test color.')
  }
}

export const rgbToHex = (rgb) => '#' + [rgb[0], rgb[1], rgb[2]].map(x => {
  const hex = x.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}).join('')

export const fillClip = (clipCanvas, clipCtx, img, color, width, height) => {
  clipCanvas.width = width
  clipCanvas.height = height
  clipCtx.save()
  clipCtx.drawImage(img, 0, 0, width, height)
  clipCtx.globalCompositeOperation = 'source-in'
  clipCtx.fillStyle = color
  clipCtx.fillRect(0, 0, width, height)
  clipCtx.restore()
}

export const transformLayer = (ctx, transform, x, y, width, height) => {
  if (!transform) return
  const { a, b, c, d, tx, ty } = transform
  const [midX, midY] = [x + width / 2, y + height / 2]
  ctx.save()
  ctx.translate(midX, midY)
  ctx.transform(a, b, c, d, tx, ty)
  ctx.translate(-midX, -midY)
}
