import './setup'
import log from './log.json'
import { mergeEvents } from './utils'

const $btn = document.getElementById('btn')
const $content = document.getElementById('content')
let count = 0

$btn.onclick = () => {
  $content.innerHTML = String(count++)
  console.log(mergeEvents(log.events))
}

$content.addEventListener('mouseenter', () => {
  $content.innerHTML = String(count++)
})
