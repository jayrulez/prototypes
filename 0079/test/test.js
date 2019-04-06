import { ShadePlugin } from './libs.js'

const should = (asserter) => (a, b) => {
  if (asserter(a, b)) return
  console.error('Asset failed, expected', b, 'actual', a)
}

const assert = {
  equal: should((a, b) => a === b)
}

export const test = () => {
  const plugin = new ShadePlugin()
  window.plugin = plugin

  assert.equal(plugin.keyGetter(), null)
}
