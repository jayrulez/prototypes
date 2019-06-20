/* eslint-env browser */

const worker = new Worker('./worker.js')

document.getElementById('go').addEventListener('click', () => {
  worker.postMessage('action', e => {
    console.log(e.data)
  })
  worker.onmessage = result => {
    console.log(result.data)
  }
})
