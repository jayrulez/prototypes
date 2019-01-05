import './setup'

const $btn = document.getElementById('btn')
const $content = document.getElementById('content')
let count = 0

$btn.onclick = () => {
  $content.innerHTML = String(count++)
}

// TMP disable "side effect" for mouse events
/*
$content.addEventListener('mouseenter', () => {
  $content.innerHTML = String(count++)
})
*/

document.addEventListener('keydown', () => {
  $content.innerHTML = String(count++)
})
