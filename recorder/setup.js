/* eslint-env browser */
/* global monitorEvents copy */

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

const events = {}
hookEvents.forEach(key => { events[key] = [] })

const log = {
  startTime: null,
  viewport: { width: null, height: null },
  url: null,
  events
}

window.log = log

console.log = withHookBefore(console.log, function () {
  const isHookedLog = (
    hookEvents.includes(arguments[0]) &&
    arguments[1] instanceof Event
  )

  if (!isHookedLog) {
    return true
  }

  const type = arguments[0]
  const e = arguments[1]
  console.info(`${type} hooked!`)
  const ts = +new Date() - log.startTime

  if (type.includes('wheel')) {
    log.events[type].push({ ts })
  } else if (type.includes('mouse') || type === 'click') {
    log.events[type].push({ ts, x: e.pageX, y: e.pageY })
  } else if (type.includes('key')) {
    log.events[type].push({ ts, key: e.key })
  } else {
    console.error(`${type} event unmatched`)
  }
  return false
})

window.init = () => {
  log.startTime = +new Date()
  log.viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  }
  log.url = window.location.href

  hookEvents.forEach(name => monitorEvents(document, name))
}

window.copyLog = () => {
  // TODO post processing for events
  copy(log)
}
