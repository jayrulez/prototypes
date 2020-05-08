import { AlloyFinger } from './alloy_finger.js'

const box = document.getElementById('box')
let left = 0
let top = 0
void new AlloyFinger(box, {
  pressMove: function (evt) {
    const { deltaX, deltaY } = evt
    left += deltaX
    top += deltaY
    box.style.left = `${left}px`
    box.style.top = `${top}px`
  }
})

const simplify = touches => {
  const result = []
  for (let i = 0; i < touches.length; i++) {
    const t = touches[i]
    result.push({ pageX: t.pageX, pageY: t.pageY })
  }
  return result
}

class MockElement {
  constructor (id) {
    this.left = 0
    this.top = 0
    this.el = document.getElementById(id)
    const noop = () => {}
    this.callbacks = {
      touchstart: noop,
      touchmove: noop,
      touchend: noop,
      touchcancel: noop
    }

    this.el.addEventListener('touchstart', e => {
      const mockEvt = {
        touches: simplify(e.touches),
        // changedTouches: simplify(e.changedTouches)
        changedTouches: true
      }
      this.callbacks.touchstart(mockEvt)
    }, false)
    this.el.addEventListener('touchmove', e => {
      const mockEvt = {
        touches: simplify(e.touches),
        // changedTouches: simplify(e.changedTouches)
        changedTouches: true
      }
      this.callbacks.touchmove(mockEvt)
    }, false)
    this.el.addEventListener('touchend', e => {
      const mockEvt = {
        touches: simplify(e.touches),
        // changedTouches: simplify(e.changedTouches)
        changedTouches: true
      }
      console.log(mockEvt.touches.length)
      this.callbacks.touchend(mockEvt)
    }, false)
    this.el.addEventListener('touchcancel', e => {
      const mockEvt = {
        touches: simplify(e.touches),
        // changedTouches: simplify(e.changedTouches)
        changedTouches: true
      }
      this.callbacks.touchcancel(mockEvt)
    }, false)
  }
  addEventListener (type, callback) {
    this.callbacks[type] = callback
  }
  removeEventListener (type, callback) {
    // TODO
    console.log(type, callback)
  }
}

const mockBox = new MockElement('mock-box')
void new AlloyFinger(mockBox, {
  longTap (evt) {
    console.log('longTap', evt)
  },
  pressMove (evt) {
    const { deltaX, deltaY } = evt
    // console.log(evt)
    mockBox.left += deltaX
    mockBox.top += deltaY
    mockBox.el.style.left = `${mockBox.left}px`
    mockBox.el.style.top = `${mockBox.top}px`
    // console.log(evt)
  }
})
window.mockBox = mockBox
