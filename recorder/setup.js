/* eslint-env browser */
/* global monitorEvents copy */

const MOUSEMOVE_RANGE = 'drag'

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
  // 'mousewheel',
  // 'click',
  'keydown',
  'keypress',
  'keyup'
]

const log = {
  startTime: null,
  viewport: { width: null, height: null },
  url: null,
  events: []
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

  if (type.includes('mouse') || type === 'click') {
    log.events.push({ ts, type, x: e.pageX, y: e.pageY })
  } else if (type.includes('key')) {
    log.events.push({ ts, type, code: e.code })
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
  if (MOUSEMOVE_RANGE === 'drag') {
    const filteredEvents = []

    let mousePressed = false
    for (let i = 0; i < log.events.length; i++) {
      const event = log.events[i]
      if (event.type === 'mousedown') {
        mousePressed = true
        filteredEvents.push(event)
      } else if (event.type === 'mouseup') {
        mousePressed = false
        filteredEvents.push(event)
      } else if (event.type === 'mousemove') {
        mousePressed && filteredEvents.push(event)
      } else {
        filteredEvents.push(event)
      }
    }

    log.events = filteredEvents
  }
  copy(log)
}
