import {
  initLine,
  initCircle,
  initTooltip
} from './conf'

export class FlexLine {
  points = []
  line = initLine()
  count = 0

  constructor (app) {
    this.app = app
  }

  get linePoints () {
    return this.points
      .map(({ circle }) => [circle.x(), circle.y()])
      .reduce((a, b) => [...a, ...b], [])
  }

  addPoint = (x, y) => {
    const id = this.count++

    // Init circle and tooltip.
    const circle = initCircle(x, y, id)
    const tooltip = initTooltip(x, y, id)

    this.points.push({ circle, tooltip })

    this.app.layer.add(circle)
    this.app.layer.add(tooltip)
    // debugger // eslint-disable-line
    this.app.layer.draw()
  }
}
