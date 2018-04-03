import { Stage, Layer, Circle, Line } from 'konva'

const stage = new Stage({
  container: 'container',
  width: 640,
  height: 480
})

const points = []
const layer = new Layer()

const line = new Line({
  stroke: 'black', points, bezier: true, tension: 0.5
})
layer.add(line)

stage.on('click', () => {
  const { x, y } = stage.getPointerPosition()
  points.push(x, y)

  // Update line points here.
  // https://github.com/konvajs/konva/issues/378
  line.setPoints(points.concat())

  const circle = new Circle({
    x, y, radius: 5, fill: 'red', stroke: 'black'
  })
  layer.add(circle)

  layer.draw()
})
stage.add(layer)
