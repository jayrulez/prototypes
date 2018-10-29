import { hashFunc } from './hash'

const hash2State = (hashNode, chunks) => {
  const { hash, children } = hashNode
  const stateNode = JSON.parse(chunks[hash])
  stateNode.children = children.map(node => hash2State(node, chunks))
  return stateNode
}

const state2Hash = (stateNode, chunks) => {
  const sanitizedState = { ...stateNode }
  delete sanitizedState.children
  const chunk = JSON.stringify(sanitizedState)
  const hashKey = hashFunc(chunk)
  chunks[hashKey] = chunk
  const hashNode = {
    hash: hashKey,
    children: stateNode.children.map(node => state2Hash(node, chunks))
  }
  return hashNode
}

export class History {
  constructor (options = {}) {
    const { rules = [], mergeDuration = 50, maxLength = 100 } = options
    this.rules = rules
    this.mergeDuration = mergeDuration
    this.maxLength = maxLength

    this.$index = 0
    this.$hashTries = []
    this.$chunks = {}

    this.$pendingState = null
    this.$pendingPromise = null
    this.$debounceTime = null
  }

  get hasRedo () {
    return this.$index < this.$hashTries.length - 1
  }

  get hasUndo () {
    const lowerBound = Math.max(this.$hashTries.length - this.maxLength, 0)
    return this.$index > lowerBound
  }

  get () {
    const currentTrie = this.$hashTries[this.$index]
    if (!currentTrie) return null

    return hash2State(currentTrie, this.$chunks)
  }

  // State => History
  pushSync (state) {
    this.$hashTries.push(state2Hash(state, this.$chunks))
    this.$index = this.$hashTries.length - 1
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

  undo () {}

  redo () {}

  reset () {}
}
