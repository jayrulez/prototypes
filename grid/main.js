console.clear()

const convert = (pxStr) => parseInt(pxStr.replace('px', ''))

// const inRange = (val, upper, lower) => lower >= val && val <= upper

const dom2Cells = () => {
  const $container = document.getElementById('container')
  const cells = []
  $container.childNodes.forEach(cell => {
    if (cell.nodeType === 3) return // ignore text nodes
    const { left, top, width, height } = window.getComputedStyle(cell)
    cells.push({
      x: [convert(left), convert(left) + convert(width)],
      y: [convert(top), convert(top) + convert(height)]
    })
  })
  return cells
}

const cells = dom2Cells()
window.cells = cells

const rightTo = (target, cells) => {
  return cells.filter(cell => {
    // ignore itself
    if (
      cell.x[0] === target.x[0] &&
      cell.x[1] === target.x[1] &&
      cell.y[0] === target.y[0] &&
      cell.y[1] === target.y[1]
    ) {
      return false
    }

    return cell.y[0] >= target.y[1]
    // return (
    //   inRange(cell.x[0], target.x[0], target.x[1]) ||
    //   inRange(cell.x[1], target.x[0], target.x[1])
    // )
  })
}

document.getElementById('test').onclick = () => {
  const removeIndex = 4
  // const dir = 'right' // ['left', 'top', 'right', 'bottom']
  const tmpCells = rightTo(cells[removeIndex], cells)
  console.log(tmpCells)
}
