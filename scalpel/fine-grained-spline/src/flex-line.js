import { Line, Shape } from 'konva'
import { Point } from './point'
import { getControlPoints } from './utils'

export class FlexLine {
  points = []
  lines = []

  constructor (app) {
    this.app = app
  }

  get segments () {
    const len = this.points.length
    if (len <= 1) return []
    const segments = []
    for (let i = 0; i < len - 1; i++) {
      const isStart = i === 0
      const isEnd = i + 1 === len - 1
      segments.push({
        from: this.points[i],
        to: this.points[i + 1],
        prev: isStart ? null : this.points[i - 1],
        next: isEnd ? null : this.points[i + 2],
        isStart,
        isEnd
      })
    }
    return segments
  }

  addPoint = (x, y) => {
    const point = new Point(this.app, this, x, y)
    this.points.push(point)
    this.drawSegments()
    point.draw()
  }

  drawQuad = (segment) => {
    const { from, to, next } = segment

    // TODO downgrade to line when no next point exists.
    if (!next) return
    const helper = getControlPoints(
      from.x,
      from.y,
      to.x,
      to.y,
      next.x,
      next.y
    )[0]

    const line = new Shape({
      sceneFunc: function (context) {
        context.beginPath()
        context.moveTo(from.x, from.y)
        context.quadraticCurveTo(helper.x, helper.y, to.x, to.y)
        context.closePath()
        // Konva specific method.
        context.strokeShape(this)
      },
      stroke: 'red',
      strokeWidth: 1
    })

    const { layer } = this.app
    layer.add(line)
  }

  drawSegments = () => {
    this.lines.forEach(line => line.destroy())
    const { layer } = this.app
    this.segments.forEach((segment) => {
      const { isStart, isEnd, from, to } = segment
      if (isStart || isEnd) {
        const line = new Line({
          stroke: '#666',
          points: [
            from.x,
            from.y,
            to.x,
            to.y
          ]
        })
        this.drawQuad(segment)
        this.lines.push(line)
        layer.add(line)
      }
    })
    layer.draw()
  }
}
