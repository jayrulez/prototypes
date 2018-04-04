import { Stage, Layer, Circle, Rect, Line } from 'konva'

export class App {
  constructor (stageConf, layerConf, lineConf) {
    this.stage = new Stage(stageConf)
    this.layer = new Layer(layerConf)
    this.line = new Line(lineConf)
    this.points = []

    this.bindStageEvents()
    this.layer.add(this.line)
    this.stage.add(this.layer)
  }

  bindStageEvents () {
    this.stage.on('click', () => {
      const { x, y } = this.stage.getPointerPosition()
      this.points.push(x, y)
      // https://github.com/konvajs/konva/issues/378
      this.line.points(this.points.concat())
      this.initCircle(x, y)
    })
  }

  initCircle (x, y) {
    const pointIndex = this.points.length / 2
    // TODO detect invalid position.
    const circle = new Circle({
      x,
      y,
      radius: 8,
      id: `circle-${pointIndex}`,
      fill: '#ddd',
      draggable: true,
      hitFunc: function (context) {
        context.beginPath()
        context.arc(0, 0, 20, 0, Math.PI * 2, true)
        context.closePath()
        context.fillStrokeShape(circle)
      }
    })
    const tooltip = new Rect({
      x: x + 6,
      y: y - 10,
      width: 6,
      height: 6,
      id: `tooltip-${pointIndex}`,
      fill: 'red'
    })
    tooltip.hide()

    // Mouse events for tooltips.
    circle.on('mouseenter', () => {
      circle.fill('blue')
      tooltip.show()
      this.layer.draw()
    })
    circle.on('mouseout', () => {
      circle.fill('#ddd')
      // Fix tooltip flickering.
      setTimeout(() => {
        if (!circle.intersects(this.stage.getPointerPosition())) {
          tooltip.hide()
          this.layer.draw()
        }
      }, 0)
    })
    tooltip.on('click', (e) => {
      e.cancelBubble = true
      this.removePoint(circle)
      tooltip.destroy()
      circle.destroy()
      this.line.points(this.points)
      this.layer.draw()
    })

    // Drag events for re-rendering line.
    circle.on('dragmove', () => {
      this.moveTooltip(tooltip, circle)
      this.getNewPoints(circle)
      this.line.points(this.points)
      this.layer.draw()
    })
    circle.on('dragend', () => {
      this.getNewPoints(circle)
      this.line.points(this.points)
      this.layer.draw()
    })

    this.layer.add(circle)
    this.layer.add(tooltip)
    this.layer.draw()
  }

  removePoint (circle) {
    const index = (parseInt(circle.id().split('-')[1]) - 1) * 2
    const newPoints = this.points.concat()
    newPoints.splice(index, 1)
    newPoints.splice(index, 1)
    this.points = newPoints
  }

  getNewPoints (circle) {
    const index = (parseInt(circle.id().split('-')[1]) - 1) * 2
    const newPoints = this.points.concat()
    newPoints[index] = circle.x()
    newPoints[index + 1] = circle.y()
    this.points = newPoints
  }

  moveTooltip (tooltip, circle) {
    tooltip.x(circle.x() + 6)
    tooltip.y(circle.y() - 10)
  }
}
