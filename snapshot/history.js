import { record2State, state2Record } from './transform'

export class History {
  constructor (options = {
    rules: [], mergeDuration: 50, maxLength: 100, rootFilter: () => true
  }) {
    this.rules = options.rules || []
    this.mergeDuration = options.mergeDuration || 50
    this.maxLength = options.maxLength || 100
    this.rootFilter = options.rootFilter || (() => true)

    this.$index = -1
    this.$records = []
    this.$chunks = {}

    this.$pendingState = null
    this.$pendingPromise = null
    this.$debounceTime = null
  }

  // Boolean
  get hasRedo () {
    // No redo when pointing to last record.
    if (this.$index === this.$records.length - 1) return false

    // Only has redo if there're valid records after index.
    // There can be no redo even if index less than records' length,
    // when we undo multi records then push a new one.
    let hasRecordAfterIndex = false
    for (let i = this.$index + 1; i < this.$records.length; i++) {
      if (this.$records[i] !== null) hasRecordAfterIndex = true
    }
    return hasRecordAfterIndex
  }

  // Boolean
  get hasUndo () {
    // Only has undo if we have records before index.
    const lowerBound = Math.max(this.$records.length - this.maxLength, 0)
    return this.$index > lowerBound
  }

  // Void => State
  get () {
    const currentTree = this.$records[this.$index]
    if (!currentTree) return null
    return record2State(currentTree, this.$chunks)
  }

  // State => History
  pushSync (state) {
    const hashTree = state2Record(
      state, this.$chunks, this.rules, this.rootFilter
    )
    this.$index++
    this.$records[this.$index] = hashTree
    // Clear redo records.
    for (let i = this.$index + 1; i < this.$records.length; i++) {
      this.$records[i] = null
    }
    // Clear first valid record if max length reached.
    if (this.$index >= this.maxLength) {
      this.$records[this.$index - this.maxLength] = null
    }

    return this
  }

  // State => Promise<History>
  push (state) {
    const currentTime = +new Date()
    if (!this.$pendingState) {
      this.$pendingState = state
      this.$debounceTime = currentTime
      this.$pendingPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          this.pushSync(this.$pendingState)
          this.$pendingState = null
          this.$debounceTime = null
          resolve(this)
          this.$pendingPromise = null
        }, this.mergeDuration)
      })
      return this.$pendingPromise
    } else if (currentTime - this.$debounceTime < this.mergeDuration) {
      this.$pendingState = state
      return this.$pendingPromise
    } else return Promise.reject(new Error('Invalid push ops'))
  }

  // Void => History
  undo () {
    if (this.hasUndo) this.$index--
    return this
  }

  // Void => History
  redo () {
    if (this.hasRedo) this.$index++
    return this
  }

  // Void => History
  reset () {
    this.$index = -1
    this.$records.forEach(tree => { tree = null })
    Object.keys(this.$chunks).forEach(key => { this.$chunks[key] = null })
    this.$records = []
    this.$chunks = {}

    this.$pendingState = null
    this.$pendingPromise = null
    this.$debounceTime = null
    return this
  }
}
