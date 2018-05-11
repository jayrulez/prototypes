import $ from 'jquery'

function addE (offset) {

}

function subE (offset) {

}

function initUI () {
  const btnAddE = document.getElementById('E+')
  const btnSubE = document.getElementById('E-')
  btnAddE.onclick = addE
  btnSubE.onclick = subE
}

$(document).ready(() => {
  initUI()

  const svg = $('#demo')
  window.svg = svg
})
