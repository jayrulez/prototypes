import { Line, Shape } from 'konva'
import { Point } from './point'
import { getControlPoints, getId } from './utils'

export class FlexLine {
  points = []
  lines = []

  constructor (app) {
    this.id = getId()
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
        next: isEnd ? null : this.points[i + 2]
      })
    }
    return segments
  }

  addPoint = (x, y) => {
    const point = new Point(this.app, this, x, y)
    this.points.push(point)
    this.draw()
  }

  removePoint = (targetId) => {
    const targetPoint = this.points.find(({ id }) => id === targetId)
    targetPoint.destroy()
    this.points = this.points.filter(({ id }) => id !== targetId)
    this.draw()
  }

  draw = () => {
    this.lines.forEach(line => line.destroy())
    this.lines = []
    this.points.forEach(point => point.draw())
    this.segments.forEach(this.drawSegment)
    this.app.layer.draw()
  }

  drawLine = (segment) => {
    const { layer } = this.app
    const { from, to } = segment
    const line = new Line({
      stroke: 'red',
      points: [from.x, from.y, to.x, to.y]
    })
    this.lines.push(line)
    layer.add(line)
  }

  drawQuad = (segment, useNext = true) => {
    const { layer } = this.app
    const { from, to, prev, next } = segment

    // Use next point or prev point as helper point.
    const helper = useNext
      ? getControlPoints(from.x, from.y, to.x, to.y, next.x, next.y)[0]
      : getControlPoints(prev.x, prev.y, from.x, from.y, to.x, to.y)[1]

    const line = new Shape({
      sceneFunc: function (context) {
        context.beginPath()
        context.moveTo(from.x, from.y)
        context.quadraticCurveTo(helper.x, helper.y, to.x, to.y)
        // Konva specific method.
        context.strokeShape(this)
      },
      stroke: 'red'
    })
    this.lines.push(line)
    layer.add(line)
  }

  drawSpline = (segment) => {
    const { layer } = this.app
    const { from, to, prev, next } = segment

    const h0 = getControlPoints(prev.x, prev.y, from.x, from.y, to.x, to.y)[1]
    const h1 = getControlPoints(from.x, from.y, to.x, to.y, next.x, next.y)[0]

    const line = new Line({
      stroke: 'red',
      bezier: true,
      points: [from.x, from.y, h0.x, h0.y, h1.x, h1.y, to.x, to.y]
    })
    this.lines.push(line)
    layer.add(line)
  }

  drawSegment = (segment) => {
    const { from, to, prev, next } = segment
    const isStart = prev === null
    const isEnd = next === null

    // Draw straight line if the line has only one segment.
    if (isStart && isEnd) {
      this.drawLine(segment)
      return
    }

    // Draw begin segment.
    if (isStart) {
      if (to.isCorner) {
        this.drawLine(segment)
        return
      }
      this.drawQuad(segment, true)
      return
    }

    // Draw end segment.
    if (isEnd) {
      if (from.isCorner) {
        this.drawLine(segment)
        return
      }
      this.drawQuad(segment, false)
      return
    }

    // Draw middle segments whose points are neither start nor end point.
    if (from.isCorner && to.isCorner) {
      this.drawLine(segment)
    } else if (from.isCorner || to.isCorner) {
      this.drawQuad(segment, from.isCorner)
    } else {
      this.drawSpline(segment)
    }
  }
}
