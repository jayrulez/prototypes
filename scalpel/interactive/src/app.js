import { Stage, Layer, Circle, Rect, Line } from 'konva'
import { initPointEvents } from './utils'

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
    this.bindLineEvents()
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
      this.addPoint(x, y)
      // https://github.com/konvajs/konva/issues/378
      this.line.points(this.linePoints)
      this.layer.draw()
    })
  }

  bindLineEvents () {
    this.line.on('click', () => {
      // TODO stage.getPointerPosition
    })
  }

  addPoint (x, y) {
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

    initPointEvents(this, id, circle, tooltip)

    // Save points for drawing line.
    this.points.push({ circle, id, tooltip })
    this.layer.add(circle)
    this.layer.add(tooltip)
    this.layer.draw()
  }

  removePoint (removeId) {
    const pointToRemove = this.points.find(({ id }) => id === removeId)
    pointToRemove.tooltip.destroy()
    pointToRemove.circle.destroy()
    this.points = this.points.filter(({ id }) => id !== removeId)
  }

  moveTooltip (tooltip, circle) {
    tooltip.x(circle.x() + 6)
    tooltip.y(circle.y() - 10)
  }
}
