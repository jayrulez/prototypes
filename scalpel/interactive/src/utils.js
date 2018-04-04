
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
