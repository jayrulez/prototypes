import html2canvas from 'html2canvas'

const container = document.getElementById('container')
const result = document.getElementById('result')

html2canvas(container).then(canvas => {
  result.appendChild(canvas)
})
