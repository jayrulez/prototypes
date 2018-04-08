import { Line } from 'konva'
import { Point } from './point'

export class FlexLine {
  points = []

  constructor (app) {
    this.app = app
  }

  get segments () {
    const len = this.points.length
    if (len <= 1) return []
    const segments = []
    for (let i = 0; i < len - 1; i++) {
      segments.push({
        fromPoint: this.points[i],
        toPoint: this.points[i + 1],
        fromStart: i === 0,
        toEnd: i + 1 === len - 1
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

  drawSegments = () => {
    const { layer } = this.app
    this.segments.forEach((segment, i) => {
      const { fromStart, toEnd, fromPoint, toPoint } = segment
      if (fromStart || toEnd) {
        const line = new Line({
          stroke: '#666',
          points: [
            fromPoint.x,
            fromPoint.y,
            toPoint.x,
            toPoint.y
          ]
        })
        layer.add(line)
      }
    })
    layer.draw()
  }
}
