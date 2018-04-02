// http://scaledinnovation.com/analytics/splines/aboutSplines.html
function getControlPoints (x0, y0, x1, y1, x2, y2, t) {
  const d01 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2))
  const d12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  const fa = t * d01 / (d01 + d12)
  const fb = t * d12 / (d01 + d12)
  const p1x = x1 - fa * (x2 - x0)
  const p1y = y1 - fa * (y2 - y0)
  const p2x = x1 + fb * (x2 - x0)
  const p2y = y1 + fb * (y2 - y0)
  return [
    { x: p1x, y: p1y }, { x: p2x, y: p2y }
  ]
}

export function drawLine (ctx, p0, p1, width, color) {
  ctx.save()
  ctx.beginPath()
  ctx.lineWidth = width
  ctx.strokeStyle = color
  ctx.moveTo(p0.x, p0.y)
  ctx.lineTo(p1.x, p1.y)
  ctx.closePath()
  ctx.stroke()
  ctx.restore()
}

export function drawPoint (ctx, x, y, r, color) {
  ctx.save()
  ctx.beginPath()
  ctx.lineWidth = 1
  ctx.fillStyle = color
  ctx.arc(x, y, r, 0.0, 2 * Math.PI, false)
  ctx.closePath()
  ctx.stroke()
  ctx.fill()
  ctx.restore()
}

export function drawSpline (ctx, points) {
  if (points.length < 2) throw new Error('wrong length')
  ctx.save()
  ctx.strokeStyle = 'blue'

  const n = points.length

  // Pack control points in pairs.
  const cPair = []
  for (let i = 0; i < n - 2; i++) {
    const p0 = points[i]
    const p1 = points[i + 1]
    const p2 = points[i + 2]
    const cPoints = getControlPoints(
      p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, 0.5
    )
    cPair.push(cPoints)
    cPoints.forEach(({ x, y }) => {
      drawPoint(ctx, x, y, 3, 'green')
    })
  }

  for (let i = 1; i < n - 2; i += 1) {
    ctx.beginPath()
    ctx.moveTo(points[i].x, points[i].y)
    ctx.bezierCurveTo(
      cPair[i - 1][1].x,
      cPair[i - 1][1].y,
      cPair[i][0].x,
      cPair[i][0].y,
      points[i + 1].x,
      points[i + 1].y
    )
    ctx.stroke()
    ctx.closePath()
  }

  // First arc.
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  ctx.quadraticCurveTo(
    cPair[0][0].x, cPair[0][0].y, points[1].x, points[1].y
  )
  ctx.stroke()
  ctx.closePath()

  // Last arc.
  ctx.beginPath()
  const last = n - 1
  ctx.moveTo(points[last].x, points[last].y)
  ctx.quadraticCurveTo(
    cPair[last - 2][1].x,
    cPair[last - 2][1].y,
    points[last - 1].x,
    points[last - 1].y
  )
  ctx.stroke()
  ctx.closePath()

  ctx.restore()
}
