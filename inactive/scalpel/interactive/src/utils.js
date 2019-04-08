
export function pointerInCircle (circle, stage) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(circle.intersects(stage.getPointerPosition()))
      } catch (e) {
        resolve(false)
      }
    }, 0)
  })
}

export function initPointEvents (app, id, circle, tooltip) {
  // Mouse events for tooltips.
  circle.on('mouseenter', () => {
    circle.fill('blue')
    tooltip.show()
    app.layer.draw()
  })
  circle.on('mouseout', () => {
    circle.fill('#ddd')
    // Fix tooltip flickering.
    pointerInCircle(circle, app.stage).then(isInCircle => {
      if (!isInCircle) {
        tooltip.hide()
        app.layer.draw()
      }
    })
  })

  tooltip.on('click', (e) => {
    e.cancelBubble = true
    app.removePoint(id)
    app.line.points(app.linePoints)
    app.layer.draw()
  })

  // Drag events for re-rendering line.
  circle.on('dragmove', () => {
    app.moveTooltip(tooltip, circle)
    app.line.points(app.linePoints)
    app.layer.draw()
  })
  circle.on('dragend', () => {
    app.line.points(app.linePoints)
    app.layer.draw()
  })
}
