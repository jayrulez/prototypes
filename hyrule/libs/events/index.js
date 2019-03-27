// Modified from https://gist.github.com/mudge/5830382

export default class EventBus {
  constructor () {
    this.events = {}
  }

  on (name, listener) {
    if (!this.events[name]) this.events[name] = []
    this.events[name].push(listener)
  }

  off (name, listener) {
    if (!Array.isArray(this.events[name])) return

    const index = this.events[name].indexOf(listener)
    if (index > -1) {
      this.events[name].splice(index, 1)
    }
  }

  emit (name, ...args) {
    const listeners = this.events[name]
    if (!Array.isArray(listeners)) return

    for (let i = 0; i < listeners.length; i++) {
      listeners[i].apply(this, args)
    }
  }
}
