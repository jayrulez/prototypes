import {
  drawLine,
  drawPoint,
  drawSpline
} from './draw'

export class Scalpel {
  constructor (canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.points = []
    this.state = {
      mouseDown: false,
      mouseX: 0,
      mouseY: 0
    }

    canvas.addEventListener('mousemove', (e) => {
      const box = canvas.getBoundingClientRect()
      this.state.mouseX = (e.clientX - box.left)
      this.state.mouseY = (e.clientY - box.top)
      this.draw()
    })

    canvas.addEventListener('click', (e) => {
      const box = canvas.getBoundingClientRect()
      const x = (e.clientX - box.left)
      const y = (e.clientY - box.top)
      this.points.push({ x, y })
      this.draw()
    })
  }
  draw () {
    const { ctx, canvas, state, points } = this
    const { mouseX, mouseY } = state
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    drawPoint(ctx, mouseX, mouseY, 3, 'black')
    points.forEach(({ x, y }) => {
      drawPoint(ctx, x, y, 3, 'red')
    })
    if (points.length <= 1) return
    if (points.length === 2) {
      drawLine(ctx, points[0], points[1], 1, 'blue')
      return
    }
    drawSpline(ctx, points)
  }
}
