/* eslint-env browser */
/* global monitorEvents copy */
let MOUSEMOVE_RANGE = 'drag'
let THROTTLE_MOUSEMOVE = true

function withHookBefore (originalFn, hookFn) {
  return function () {
    if (hookFn.apply(this, arguments) === false) {
      return
    }
    return originalFn.apply(this, arguments)
  }
}

function withArgsHook (originalFn, argsGetter) {
  return function () {
    const _args = argsGetter.apply(this, arguments)
    if (Array.isArray(_args)) {
      for (let i = 0; i < _args.length; i++) arguments[i] = _args[i]
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
  // 'keypress',
  'keyup'
]

const log = {
  startTime: null,
  viewport: { width: null, height: null },
  url: null,
  events: []
}

window.log = log

EventTarget.prototype.addEventListener = withArgsHook(
  EventTarget.prototype.addEventListener,
  function (type, listener, options) {
    const hookedListener = withHookBefore(listener, function () {
      console.log('hooked')
    })
    if (hookEvents.includes(type)) return [type, hookedListener, options]
  }
)

/*
console.log = withHookBefore(console.log, function () {
  const isHookedLog = (
    hookEvents.includes(arguments[0]) &&
    arguments[1] instanceof Event
  )

  if (!isHookedLog) return true

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
*/

window.init = (throttleMouseMove = false, range = 'drag') => {
  MOUSEMOVE_RANGE = range
  THROTTLE_MOUSEMOVE = throttleMouseMove
  log.startTime = +new Date()
  log.viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  }
  log.url = window.location.href

  hookEvents.forEach(name => monitorEvents(document, name))
}

window.copyLog = () => {
  const groupItem = (items, eq) => {
    if (items.length === 0) return []
    const groups = [[items[0]]]

    for (let i = 1; i < items.length; i++) {
      const lastGroup = groups[groups.length - 1]
      const lastItem = lastGroup[lastGroup.length - 1]
      if (eq(lastItem, items[i])) lastGroup.push(items[i])
      else groups.push([items[i]])
    }
    return groups
  }

  const mergeDoubleClick = (events = []) => {
    const results = []
    let i = 0
    while (true) {
      const subEvents = events.slice(i, i + 4)
      if (
        subEvents.length === 4 &&
        subEvents[0].type === 'mousedown' &&
        subEvents[1].type === 'mouseup' &&
        subEvents[2].type === 'mousedown' &&
        subEvents[3].type === 'mouseup' &&
        subEvents[3].ts - subEvents[0].ts < 500 &&
        subEvents.every(e => e.x === subEvents[0].x && e.y === subEvents[0].y)
      ) {
        results.push({ ...subEvents[0], type: 'dblclick' })
        i += 4
      } else {
        results.push(events[i])
        i++
      }

      if (i >= events.length) break
    }
    return results
  }

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

  if (THROTTLE_MOUSEMOVE) {
    const groupedEvents = groupItem(log.events, (a, b) => a.type === b.type)
    log.events = groupedEvents
      .map(group => {
        if (group[0].type !== 'mousemove') return group
        // TODO fine-grained throttle
        return group.length <= 2 ? group : [group[0], group[group.length - 1]]
      })
      .reduce((a, b) => [...a, ...b])
  }

  // Merge double click events, or else puppeteer can't simulate it.
  const clickMergedEvents = mergeDoubleClick(log.events)
  log.events = clickMergedEvents

  copy(log)
}
