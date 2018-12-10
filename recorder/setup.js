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

const log = {
  startTime: +new Date(),
  viewport: { width: null, height: null },
  url: null,
  events: {
    click: [],
    mouse: [],
    wheel: [],
    key: []
  }
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
  console.info(`${type} hooked!`)
  const ts = +new Date() - log.startTime
  if (type.includes('wheel')) {
    log.events.wheel.push({ ts })
  } else if (type.includes('mouse')) {
    log.events.mouse.push({ ts })
  } else if (type.includes('key')) {
    log.events.key.push({ ts })
  } else if (type === 'click') {
    log.events.click.push({ ts })
  } else {
    console.error(`${type} event unmatched`)
  }
  return false
})

window.init = () => {
  hookEvents.forEach(name => monitorEvents(document, name))
}

window.copyLog = () => {
  copy(log)
}
