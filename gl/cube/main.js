/* eslint-env browser */
import { Cube } from './cube'
import { Solver } from './solver'

const canvas = document.querySelector('#glcanvas')
const cube = new Cube(canvas, ['L', 'U', 'B', 'D', 'U', 'F\''])
const solver = new Solver(cube)

const $rangeX = document.getElementById('range-x')
const $rangeY = document.getElementById('range-y')
const render = () => cube.render($rangeX.value, $rangeY.value)

$rangeX.addEventListener('input', render)
$rangeY.addEventListener('input', render)
window.cube = cube; window.solver = solver
// Try `cube.render()` in console!
