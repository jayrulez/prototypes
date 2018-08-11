/* eslint-env browser */
import { Cube } from './cube'

const canvas = document.querySelector('#glcanvas')
window.cube = new Cube(canvas)
// Try `cube.render()` in console!

function loop () {
  localStorage.delta = (parseFloat(localStorage.delta) || 0) + 0.01
  window.cube.render(localStorage.delta)
  requestAnimationFrame(loop)
}

if (localStorage._ANIMATE) loop()
