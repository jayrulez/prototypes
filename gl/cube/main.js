/* eslint-env browser */
import { Cube } from './cube'
import { Solver } from './solver'

const canvas = document.querySelector('#glcanvas')
window.cube = new Cube(canvas, ['L', 'U', 'B', 'D', 'U', 'F\''])
window.solver = new Solver(window.cube)
// Try `cube.render()` in console!

function loop () {
  localStorage.delta = (parseFloat(localStorage.delta) || 0) + 0.01
  window.cube.render(localStorage.delta)
  requestAnimationFrame(loop)
}

if (localStorage._ANIMATE) loop()
