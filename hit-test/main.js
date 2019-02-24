const elements = [
  { type: 'rect', name: 'a', width: 150, height: 50, left: 30, top: 0 },
  { type: 'rect', name: 'b', width: 20, height: 50, left: 100, top: 20 }
]

const $canvas = document.getElementById('canvas')
const context = $canvas.getContext('2d')

const draw = (context, elements) => {
  console.log(context, elements)
}

document.getElementById('btn').onclick = () => {
  draw(context, elements)
}
