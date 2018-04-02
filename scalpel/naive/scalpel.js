
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
    })
  }
  // Basic `quadraticCurveTo` approach.
  draw () {
    const { ctx, canvas, state, points } = this
    const { mouseX, mouseY } = state

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = 'red'
    points.forEach(({ x, y }) => {
      ctx.fillRect(x, y, 5, 5)
    })

    ctx.fillStyle = 'black'
    ctx.fillRect(mouseX, mouseY, 5, 5)

    if (points.length <= 4) return

    ctx.beginPath()
    ctx.strokeStyle = 'blue'
    ctx.moveTo(points[0].x, points[0].y)

    let i
    for (i = 1; i < points.length - 1; i++) {
      const xMid = (points[i].x + points[i + 1].x) / 2
      const yMid = (points[i].y + points[i + 1].y) / 2
      const cpX1 = (xMid + points[i].x) / 2
      // const cpY1 = (yMid + points[i].y) / 2
      const cpX2 = (xMid + points[i + 1].x) / 2
      // const cpY2 = (yMid + points[i + 1].y) / 2
      ctx.quadraticCurveTo(cpX1, points[i].y, xMid, yMid)
      ctx.quadraticCurveTo(cpX2, points[i + 1].y, points[i + 1].x, points[i + 1].y)
    }
    ctx.stroke()
  }
}
