import { Stage, Layer, Circle, Line } from 'konva'

function getNewPoints (circle, points) {
  const index = (parseInt(circle.id().split('-')[1]) - 1) * 2
  const newPoints = points.concat()
  newPoints[index] = circle.x()
  newPoints[index + 1] = circle.y()
  return newPoints
}

function bindCircleEvents (x, y, layer, points, line) {
  const circle = new Circle({
    x,
    y,
    radius: 5,
    id: `circle-${points.length / 2}`,
    fill: 'red',
    stroke: 'black',
    draggable: true
  })
  circle.on('dragmove', () => {
    const newPoints = getNewPoints(circle, points)
    line.setPoints(newPoints)
    layer.draw()
  })
  circle.on('dragend', () => {
    const newPoints = getNewPoints(circle, points)
    line.setPoints(newPoints)
    layer.draw()
  })
  layer.add(circle)
  layer.draw()
}

function bindStageEvents (stage, layer, points, line) {
  stage.on('click', () => {
    const { x, y } = stage.getPointerPosition()
    points.push(x, y)

    // https://github.com/konvajs/konva/issues/378
    line.setPoints(points.concat())
    bindCircleEvents(x, y, layer, points, line)
  })
}

export function main (stageConf, layerConf, lineConf) {
  const stage = new Stage(stageConf)
  const layer = new Layer(layerConf)
  const line = new Line(lineConf)
  const points = []

  bindStageEvents(stage, layer, points, line)
  layer.add(line)
  stage.add(layer)
}
