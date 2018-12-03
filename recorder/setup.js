/* eslint-env browser */
/* global monitorEvents */

function withHookBefore (originalFn, hookFn) {
  return function () {
    if (hookFn.apply(this, arguments) === false) {
      return
    }
    return originalFn.apply(this, arguments)
  }
}

const hookEvents = [
  'mousedown',
  'mousemove',
  'mouseup',
  'mousewheel',
  'click',
  'keydown',
  'keypress',
  'keyup'
]

console.log = withHookBefore(console.log, function () {
  const isHookedLog = (
    hookEvents.includes(arguments[0]) &&
    arguments[1] instanceof Event
  )

  if (!isHookedLog) {
    return true
  }

  console.info(`${arguments[0]} hooked!`)
  return false
})

window.init = () => {
  hookEvents.forEach(name => monitorEvents(document, name))
}
