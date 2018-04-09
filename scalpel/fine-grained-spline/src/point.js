import { Circle, Rect, Arc } from 'konva'
import { getId } from './utils'

const mainConf = {
  radius: 8,
  fill: '#ddd',
  draggable: true
}

const delConf = {
  width: 6,
  height: 6,
  fill: 'red'
}

const cornerConf = {
  width: 6,
  height: 6,
  fill: 'blue'
}

const dragBarConf = {
  innerRadius: 8,
  outerRadius: 16,
  angle: 360,
  fill: 'yellow'
}

const draggerConf = {
  radius: 8,
  fill: '#ddd'
}

export class Point {
  isCorner = false

  constructor (app, parent, x, y) {
    this.id = getId()
    this.mainMark = new Circle({ x, y, ...mainConf })
    this.delMark = new Rect({ x: x + 6, y: y - 10, ...delConf })
    this.dragBar = new Arc({ x, y, ...dragBarConf })
    this.cornerMark = new Rect({ x: x - 12, y: y - 10, ...cornerConf })
    this.app = app
    this.parent = parent

    this.initDragBarEvents()
    this.initDelMarkEvents()
  }

  get x () {
    return this.mainMark.x()
  }

  get y () {
    return this.mainMark.y()
  }

  initDelMarkEvents = () => {
    this.delMark.on('click', (e) => {
      e.cancelBubble = true
      this.parent.removePoint(this.id)
    })
  }

  initDragBarEvents = () => {
    const { stage, layer } = this.app
    const onDragBarMousedown = () => {
      const { x, y } = stage.getPointerPosition()
      const dragger = new Circle({ x, y, ...draggerConf })
      layer.add(dragger)
      layer.draw()

      const onWindowMousemove = () => {
        const { x, y } = stage.getPointerPosition()
        dragger.x(x)
        dragger.y(y)
        layer.draw()
      }

      const onWindowMouseup = () => {
        window.removeEventListener('mousemove', onWindowMousemove)
        const { x, y } = stage.getPointerPosition()
        dragger.destroy()
        this.parent.addPoint(x, y)
        layer.draw()
      }

      window.addEventListener('mousemove', onWindowMousemove)
      window.addEventListener('mouseup', onWindowMouseup, { once: true })
    }

    this.dragBar.on('mousedown', onDragBarMousedown)
  }

  draw = () => {
    const { layer } = this.app
    layer.add(this.mainMark)
    layer.add(this.dragBar)
    layer.add(this.delMark)
    layer.add(this.cornerMark)
    layer.draw()
  }

  destroy = () => {
    this.mainMark.destroy()
    this.dragBar.destroy()
    this.delMark.destroy()
    this.cornerMark.destroy()
  }
}
