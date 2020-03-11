import { AlloyFinger } from './alloy_finger.js'

const box = document.getElementById('box')
let left = 0
let top = 0
void new AlloyFinger(box, {
  pressMove: function (evt) {
    console.log(evt)
    const { deltaX, deltaY } = evt
    left += deltaX
    top += deltaY
    box.style.left = `${left}px`
    box.style.top = `${top}px`
  }
})
