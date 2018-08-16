/* eslint-env browser */
import { Cube } from './cube'
import { Solver } from './solver'

const canvas = document.querySelector('#glcanvas')
const cube = new Cube(canvas).shuffle()
const solver = new Solver(cube)

const $rangeX = document.getElementById('range-x')
const $rangeY = document.getElementById('range-y')
const renderCube = () => cube.render($rangeX.value, $rangeY.value)

$rangeX.addEventListener('input', renderCube)
$rangeY.addEventListener('input', renderCube)
window.cube = cube; window.solver = solver
// Try `cube.render()` and `solver.solveCross()` in console!
