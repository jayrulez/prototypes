import { Stage, Layer, Circle, Rect, Line } from 'konva'
import { pointerInCircle } from './utils'

export class App {
  constructor (stageConf, layerConf, lineConf) {
    // debug
    window.app = this
    this.stage = new Stage(stageConf)
    this.layer = new Layer(layerConf)
    this.line = new Line(lineConf)
    this.points = []
    this.count = 0

    this.bindStageEvents()
    this.layer.add(this.line)
    this.stage.add(this.layer)
  }

  get linePoints () {
    return this.points
      .map(({ circle }) => [circle.x(), circle.y()])
      .reduce((a, b) => [...a, ...b], [])
  }

  bindStageEvents () {
    this.stage.on('click', () => {
      const { x, y } = this.stage.getPointerPosition()
      this.addCircle(x, y)
      // https://github.com/konvajs/konva/issues/378
      this.line.points(this.linePoints)
      this.layer.draw()
    })
  }

  addCircle (x, y) {
    // FIXME
    const id = this.count++
    // TODO detect invalid position.
    const circle = new Circle({
      x,
      y,
      id: `circle-${id}`,
      radius: 8,
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
      id: `tooltip-${id}`,
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
      pointerInCircle(circle, this.stage).then(isInCircle => {
        if (!isInCircle) {
          tooltip.hide()
          this.layer.draw()
        }
      })
    })

    tooltip.on('click', (e) => {
      e.cancelBubble = true
      this.removePoint(circle)
      tooltip.destroy()
      circle.destroy()
      this.line.points(this.linePoints)
      this.layer.draw()
    })

    // Drag events for re-rendering line.
    circle.on('dragmove', () => {
      this.moveTooltip(tooltip, circle)
      this.line.points(this.linePoints)
      this.layer.draw()
    })
    circle.on('dragend', () => {
      this.line.points(this.linePoints)
      this.layer.draw()
    })

    // Save points for drawing line.
    this.points.push({ circle, id, tooltip })
    this.layer.add(circle)
    this.layer.add(tooltip)
    this.layer.draw()
  }

  removePoint (circle) {
    const circleId = parseInt(circle.id().split('-')[1])
    this.points = this.points.filter(({ id }) => id !== circleId)
  }

  moveTooltip (tooltip, circle) {
    tooltip.x(circle.x() + 6)
    tooltip.y(circle.y() - 10)
  }
}
