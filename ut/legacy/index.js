/* eslint-env browser */

const ready = (object) => {
  const event = new CustomEvent('test-ready')
  window.__TEST_OBJECCT__ = object
  dispatchEvent(event)
}

module.exports = {
  ready
}
