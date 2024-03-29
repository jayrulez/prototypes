import venus from './venus.jpg'

{
  const canvas = document.getElementById('c1')
  const ctx = canvas.getContext('2d')
  console.log(ctx)

  // Example 1
  // ctx.fillStyle = 'red'
  // ctx.fillRect(10, 10, 100, 100)

  // ctx.lineWidth = 4
  // ctx.strokeStyle = '#4285f4'
  // ctx.strokeRect(10, 10, 100, 100)

  // ctx.clearRect(50, 50, 100, 100)

  // Example 2
  // ctx.moveTo(50, 140)
  // ctx.lineTo(150, 60)
  // ctx.lineTo(250, 140)
  // ctx.closePath()
  // ctx.stroke()
  // ctx.fill()
}

{
  const canvas = document.getElementById('c1')
  const ctx = canvas.getContext('2d')

  // First path
  ctx.beginPath()
  ctx.strokeStyle = 'blue'
  ctx.moveTo(10, 10)
  ctx.lineTo(100, 10)
  ctx.stroke()

  // Second path
  ctx.beginPath()
  ctx.strokeStyle = 'green'
  ctx.moveTo(10, 10)
  ctx.lineTo(10, 100)
  ctx.stroke()
}

{
  const canvas = document.getElementById('c2')
  const ctx = canvas.getContext('2d')
  // First path
  // ctx.beginPath()
  // ctx.strokeStyle = 'blue'
  ctx.moveTo(10, 10)
  ctx.lineTo(100, 10)
  // ctx.beginPath()
  ctx.moveTo(10, 10)
  ctx.lineTo(100, 20)
  ctx.stroke()

  // Second path
  ctx.beginPath()
  ctx.strokeStyle = 'green'
  ctx.moveTo(10, 10)
  ctx.lineTo(10, 100)
  ctx.stroke()
}

const COLORS = {
  GREY: 'grey',
  BLACK: 'black',
  RED: 'red',
  GREEN: 'green',
  WHITE: 'white',
  BLUE: 'blue'
}

{
  const canvas = document.getElementById('c3')
  const ctx = canvas.getContext('2d')
  // Tangential lines
  ctx.beginPath()
  ctx.strokeStyle = COLORS.GREY
  ctx.moveTo(200, 20)
  ctx.lineTo(200, 130)
  ctx.lineTo(50, 20)
  ctx.stroke()

  // Arc
  ctx.beginPath()
  ctx.strokeStyle = COLORS.BLACK
  ctx.lineWidth = 5
  ctx.moveTo(200, 20)
  ctx.arcTo(200, 130, 50, 20, 40)
  ctx.stroke()

  // Start point
  ctx.beginPath()
  ctx.fillStyle = COLORS.BLUE
  ctx.arc(200, 20, 5, 0, 2 * Math.PI)
  ctx.fill()

  // Control points
  ctx.beginPath()
  ctx.fillStyle = COLORS.RED
  ctx.arc(200, 130, 5, 0, 2 * Math.PI) // Control point 1
  ctx.arc(50, 20, 5, 0, 2 * Math.PI) // Control point 2
  ctx.fill()
}

{
  const canvas = document.getElementById('c4')
  const ctx = canvas.getContext('2d')
  // ctx.beginPath()
  // ctx.ellipse(100, 100, 50, 75, Math.PI / 4, 0, 2 * Math.PI)
  // ctx.stroke()

  ctx.fillStyle = COLORS.RED
  ctx.beginPath()
  ctx.ellipse(60, 75, 50, 30, Math.PI * 0.25, 0, Math.PI * 1.5)
  ctx.fill()

  ctx.fillStyle = COLORS.BLUE
  ctx.beginPath()
  ctx.ellipse(150, 75, 50, 30, Math.PI * 0.25, 0, Math.PI)
  ctx.fill()

  ctx.fillStyle = COLORS.GREEN
  ctx.beginPath()
  ctx.ellipse(240, 75, 50, 30, Math.PI * 0.25, 0, Math.PI, true)
  ctx.fill()
}

{
  const canvas = document.getElementById('c5')
  const ctx = canvas.getContext('2d')
  ctx.font = '50px serif'
  ctx.fillText('Hello world', 50, 90)
}

{
  const canvas = document.getElementById('c6')
  const ctx = canvas.getContext('2d')

  ctx.save()
  ctx.fillStyle = COLORS.WHITE
  ctx.fillRect(0, 0, 200, 200)
  ctx.restore()

  ctx.save()
  ctx.scale(2, 2) // scale = 2
  {
    ctx.save() // scale = 2
    ctx.scale(0.5, 0.5) // scale = 1
    ctx.moveTo(0, 0) // (0, 0)
    ctx.lineTo(0, 100) // (0, 100)
    ctx.restore() // scale = 2
  }
  ctx.lineTo(100, 100) // (200, 200)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

{
  const canvas = document.getElementById('c7')
  const ctx = canvas.getContext('2d')

  ctx.strokeStyle = COLORS.RED
  ctx.lineWidth = 2
  ctx.strokeRect(49, 49, 4, 4)

  ctx.save()

  ctx.translate(50, 50)
  ctx.moveTo(0, 0)
  ctx.lineTo(100, 0)

  ctx.restore()
  ctx.lineTo(100, 100)
  ctx.closePath()
  ctx.fill()

  ctx.restore()

  // ctx.restore()
}

{
  const canvas = document.getElementById('c8')
  const ctx = canvas.getContext('2d')
  const img = new Image()
  img.src = venus
  const spriteX = 50
  const spriteY = 50
  const imageX = -10
  const imageY = -10
  img.onload = () => {
    ctx.translate(spriteX, spriteY)

    const path = new Path2D()
    path.rect(0, 0, 100, 100)
    ctx.clip(path)

    ctx.scale(2, 2)
    ctx.drawImage(img, imageX, imageY, 100, 100)

    ctx.translate(-spriteX, -spriteY)
  }
}