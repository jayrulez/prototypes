/* global arguments */
/* eslint-disable no-extend-native */
Function.prototype.before = function (fn) {
  const _this = this
  return function () {
    if (fn.apply(this, arguments) === false) {
      return false
    }
    return _this.apply(this, arguments)
  }
}

console.log = console.log.before(() => {
  console.info('hooked!')
  console.info(arguments)
})
