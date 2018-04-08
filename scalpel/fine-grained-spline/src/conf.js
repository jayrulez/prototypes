import { Stage, Layer, Line, Circle, Rect } from 'konva'

export const initStage = () => new Stage({
  container: 'container',
  width: 640,
  height: 480
})

export const initLayer = () => new Layer({})

export const initLine = () => new Line({
  stroke: '#666',
  points: [],
  bezier: true,
  tension: 0.5
})

export const initCircle = (x, y, id) => {
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
  return circle
}

export const initTooltip = (x, y, id) => new Rect({
  x: x + 6,
  y: y - 10,
  width: 6,
  height: 6,
  id: `tooltip-${id}`,
  fill: 'red'
})
