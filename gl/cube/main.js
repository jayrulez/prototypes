/* eslint-env browser */
import { Cube } from './model/cube'
import { Solver } from './model/solver'

const canvas = document.querySelector('#glcanvas')
const cube = new Cube(canvas, JSON.parse(localStorage.moves || '[]'))
const solver = new Solver(cube)

const $rangeX = document.getElementById('range-x')
const $rangeY = document.getElementById('range-y')
const renderCube = () => {
  cube.rX = parseInt($rangeX.value); cube.rY = parseInt($rangeY.value)
  cube.render($rangeX.value, $rangeY.value)
}

$rangeX.addEventListener('input', renderCube)
$rangeY.addEventListener('input', renderCube)
cube.rX = 30; cube.rY = -45; cube.render(30, -45)
window.cube = cube; window.solver = solver
// Try `cube.render()` and `solver.solve()` in console!
