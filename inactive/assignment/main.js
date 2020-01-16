/* eslint-env browser */
import * as utils from './utils.js'

class RippleContainer {
  constructor ($el) {
    this.$el = $el
    // XXX: should be self-contained
    this.$ripple = document.getElementById('ripple')

    this.rippleState = {
      x: null,
      y: null,
      sizes: []
    }

    $el.addEventListener('mousedown', e => {
      utils.scheduleOnDown(this.rippleState, e)
    })

    $el.addEventListener('mousemove', e => {
      utils.scheduleOnMove(this.rippleState, e)
    })

    $el.addEventListener('mouseup', e => {
      utils.scheduleOnUp(this.rippleState, e)
    })

    const tick = () => {
      const { rippleState } = this
      const rippleSize = 25

      const nextSize = rippleState.sizes.shift()
      if (nextSize !== undefined) {
        const { x, y } = rippleState
        this.$ripple.style.left = `${x - rippleSize}px`
        this.$ripple.style.top = `${y - rippleSize}px`
        this.$ripple.style.opacity = nextSize
      }

      requestAnimationFrame(tick)
    }
    tick()
  }
}

const $el = document.getElementById('content')
void new RippleContainer($el)
