import '../../../recorder'

const $content = document.getElementById('content')
let count = 0

$content.onclick = () => {
  $content.innerHTML = String(count++)
}

document.addEventListener('keydown', () => {
  $content.innerHTML = String(count++)
})
