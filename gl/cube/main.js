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

const flat = arr => {
  if (arr.includes(null)) return []
  else if (arr.every(x => typeof x === 'string')) return arr
  return arr.reduce((a, b) => [...a, ...b], [])
}

const rules = [
  { id: 'btn-shuffle', ops: () => cube.shuffle(20, true) },
  { id: 'btn-cross', ops: () => cube.animate(flat(solver.solveCross())) },
  { id: 'btn-f2l', ops: () => cube.animate(flat(solver.solveF2L() || [])) },
  { id: 'btn-oll', ops: () => cube.animate(flat(solver.solveOLL() || [])) },
  { id: 'btn-pll', ops: () => cube.animate(flat(solver.solvePLL() || [])) }
]
rules.forEach(rule => {
  document.getElementById(rule.id).addEventListener('click', rule.ops)
})

$rangeX.addEventListener('input', renderCube)
$rangeY.addEventListener('input', renderCube)
cube.rX = 30; cube.rY = -45; cube.render(30, -45)
window.cube = cube; window.solver = solver
// Try `cube.render()` and `solver.solve()` in console!
