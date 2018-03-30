
export class Scalpel {
  canvas = null
  ctx = null
  points = []
  state = {
    mouseDown: false,
    mouseX: 0,
    mouseY: 0
  }

  constructor (canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')

    canvas.addEventListener('mousemove', (e) => {
      const box = canvas.getBoundingClientRect()
      this.state.mouseX = (e.clientX - box.left)
      this.state.mouseY = (e.clientY - box.top)
      this.render()
    })

    canvas.addEventListener('click', (e) => {
      const box = canvas.getBoundingClientRect()
      const pointX = (e.clientX - box.left)
      const pointY = (e.clientY - box.top)
      this.points.push([pointX, pointY])
    })
  }

  render = () => {
    const { ctx, canvas, state } = this
    const { mouseX, mouseY } = state

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = 'red'
    this.points.forEach(([x, y]) => {
      ctx.fillRect(x, y, 5, 5)
    })

    ctx.fillStyle = 'black'
    ctx.fillRect(mouseX, mouseY, 5, 5)
  }
}
