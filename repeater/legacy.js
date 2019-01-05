const mergeEvents = (eventStore) => {
  const eventTypes = Object.keys(eventStore)
  const events = eventTypes
    .map(type => eventStore[type].map(event => ({ ...event, type })))
    .reduce((a, b) => [...a, ...b], [])
    .sort((a, b) => a.ts - b.ts)
  for (let i = 0; i < events.length; i++) {
    events[i].interval = i === 0
      ? events[i].ts : events[i].ts - events[i - 1].ts
  }
  return events
}

module.exports = {
  mergeEvents
}
