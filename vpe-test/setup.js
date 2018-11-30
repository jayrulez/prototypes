/* eslint-env browser */
/* global monitorEvents */
/* eslint-disable no-extend-native */

Function.prototype.before = function (hookFn) {
  const _this = this
  return function () {
    if (hookFn.apply(this, arguments) === false) {
      return false
    }
    return _this.apply(this, arguments)
  }
}

const hookEvents = ['mousedown', 'mousemove', 'mouseup', 'click']

console.log = console.log.before(function () {
  const isHookedLog = (
    hookEvents.includes(arguments[0]) &&
    arguments[1] instanceof MouseEvent
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
