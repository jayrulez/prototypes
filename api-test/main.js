
const foo = () => {
  navigator.clipboard
    .read()
    .then(data => {
      debugger // eslint-disable-line
      // data.types
      // data.getData('text')
    })
    .catch(console.error)
}

document.getElementById('read').addEventListener('click', foo)
document.addEventListener('paste', e => {
  debugger // eslint-disable-line
})
