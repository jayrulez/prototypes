import { Stage, Layer, Circle, Line } from 'konva'

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
    const circle = new Circle({
      x,
      y,
      radius: 5,
      id: `circle-${this.points.length / 2}`,
      fill: 'red',
      stroke: 'black',
      draggable: true,
      hitFunc: function (context) {
        context.beginPath()
        context.arc(0, 0, 15, 0, Math.PI * 2, true)
        context.closePath()
        context.fillStrokeShape(circle)
      }
    })
    circle.on('mouseenter', () => {
      console.log('enter')
    })
    circle.on('dragmove', () => {
      this.getNewPoints(circle, this.points)
      this.line.setPoints(this.points.concat())
      this.layer.draw()
    })
    circle.on('dragend', () => {
      this.getNewPoints(circle, this.points)
      this.line.setPoints(this.points.concat())
      this.layer.draw()
    })
    this.layer.add(circle)
    this.layer.draw()
  }

  getNewPoints (circle, points) {
    const index = (parseInt(circle.id().split('-')[1]) - 1) * 2
    const newPoints = points.concat()
    newPoints[index] = circle.x()
    newPoints[index + 1] = circle.y()
    this.points = newPoints
  }
}
