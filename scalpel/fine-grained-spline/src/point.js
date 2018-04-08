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

const dragConf = {
  innerRadius: 8,
  outerRadius: 16,
  angle: 360,
  fill: 'yellow'
}

export class Point {
  constructor (layer, x, y) {
    this.id = getId()
    this.mainMark = new Circle({ x, y, ...mainConf })
    this.delMark = new Rect({ x: x + 6, y: y - 10, ...delConf })
    this.dragBar = new Arc({ x, y, ...dragConf })
    this.cornerMark = new Rect({ x: x - 12, y: y - 10, ...cornerConf })

    layer.add(this.mainMark)
    layer.add(this.dragBar)
    layer.add(this.delMark)
    layer.add(this.cornerMark)
  }

  get x () {
    return this.mainMark.x()
  }

  get y () {
    return this.mainMark.y()
  }
}
