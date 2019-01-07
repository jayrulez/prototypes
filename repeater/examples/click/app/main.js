import '../../../recorder'

const $content = document.getElementById('content')
let count = 0

document.addEventListener('click', () => {
  $content.innerHTML = String(count++)
})

document.addEventListener('keydown', () => {
  $content.innerHTML = String(count++)
})
