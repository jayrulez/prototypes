import './setup'

const $btn = document.getElementById('btn')
const $content = document.getElementById('content')
let count = 0

$btn.onclick = () => {
  $content.innerHTML = String(count++)
}

$content.addEventListener('mouseenter', () => {
  $content.innerHTML = String(count++)
})
