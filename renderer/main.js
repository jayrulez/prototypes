import { Layer } from './layer'

console.clear()
const canvas = document.getElementById('playground')
const layer = new Layer(canvas)
layer.render()
window.layer = layer
