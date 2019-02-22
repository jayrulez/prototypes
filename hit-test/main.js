document.getElementById('btn').onclick = () => {
  const $canvas = document.getElementById('canvas')
  const context = $canvas.getContext('2d')
  console.log(context)
}
