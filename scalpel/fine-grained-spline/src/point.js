import { Circle, Rect, Arc } from 'konva'
import { getId } from './utils'

const mainConf = {
  radius: 8,
  fill: '#ddd',
  draggable: true
}

const delStyle = {
  width: 6,
  height: 6,
  fill: 'red'
}

const cornerStyle = {
  width: 6,
  height: 6,
  fill: 'blue'
}

const dragBarStyle = {
  innerRadius: 8,
  outerRadius: 16,
  angle: 360,
  fill: 'yellow'
}

const draggerStyle = {
  radius: 8,
  fill: '#ddd'
}

export class Point {
  isCorner = false
  id = getId()

  constructor (app, parent, x, y) {
    this.mainMark = new Circle({ x, y, ...mainConf })
    this.delMark = new Rect({ x: x + 6, y: y - 10, ...delStyle })
    this.dragBar = new Arc({ x, y, ...dragBarStyle })
    this.cornerMark = new Rect({ x: x - 12, y: y - 10, ...cornerStyle })
    this.app = app
    this.parent = parent

    this.initEvents()
  }

  get x () {
    return this.mainMark.x()
  }

  get y () {
    return this.mainMark.y()
  }

  initEvents = () => {
    this.initDragBarEvents()
    this.initDelMarkEvents()
    this.initCornerMarkEvents()
    this.initMainMarkEvents()
  }

  initMainMarkEvents = () => {
    this.mainMark.on('dragmove', () => {
      const x = this.mainMark.x()
      const y = this.mainMark.y()
      this.delMark.x(x + 6)
      this.delMark.y(y - 10)
      this.dragBar.x(x)
      this.dragBar.y(y)
      this.cornerMark.x(x - 12)
      this.cornerMark.y(y - 10)
      this.parent.draw()
    })
  }

  initDelMarkEvents = () => {
    this.delMark.on('click', (e) => {
      e.cancelBubble = true
      this.parent.removePoint(this.id)
    })
  }

  initCornerMarkEvents = () => {
    this.cornerMark.on('click', (e) => {
      e.cancelBubble = true
      this.isCorner = !this.isCorner
      this.parent.draw()
    })
  }

  initDragBarEvents = () => {
    const { stage, layer } = this.app
    const onDragBarMousedown = () => {
      const { x, y } = stage.getPointerPosition()
      const dragger = new Circle({ x, y, ...draggerStyle })
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
