function getSkewPoint (point, offsetX, offsetY, skewX, skewY) {
  const dx = point.x - offsetX
  const dy = point.y - offsetY
  return {
    x: offsetX + (dx + Math.tan(skewX) * dy),
    y: offsetY + (dy + Math.tan(skewY) * dx)
  }
}

const points = [
  {x: 249.62877856357832, y: 335.888},
  {x: 649.9967785635783, y: 335.888},
  {x: 649.9967785635783, y: 403.9184154136141},
  {x: 249.62877856357832, y: 403.9184154136141}
]

function demoSkew (point) {
  return getSkewPoint(point, points[3].x, points[3].y, 0.3, 0.2)
}

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

function drawShape (ctx, points, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 0; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y)
  }
  ctx.closePath()
  ctx.fill()
}

drawShape(ctx, points, 'red')

const skewedPoints = points.map(demoSkew)
drawShape(ctx, skewedPoints, 'yellow')
