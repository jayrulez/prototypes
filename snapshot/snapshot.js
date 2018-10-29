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
  const hash = hashFunc(chunk)
  chunks[hash] = chunk
  const hashNode = {
    hash,
    children: stateNode.children.map(node => state2Hash(node, chunks))
  }
  return hashNode
}

export class Snapshot {
  constructor (options = {}) {
    const { rules = [] } = options
    this.rules = rules

    this.$index = 0
    this.$hashTries = []
    this.$chunks = {}
  }

  get hasUndo () {
    return false
  }

  get hasRedo () {
    return false
  }

  get () {
    const currentTrie = this.$hashTries[this.$index]
    if (!currentTrie) return null

    return hash2State(currentTrie, this.$chunks)
  }

  // @return Snapshot
  pushSync (state) {
    this.$hashTries.push(state2Hash(state, this.$chunks))
    this.$index = this.$hashTries.length - 1
  }

  // @return Promise<Snapshot>
  pushAsync () {}

  undo () {}

  redo () {}

  reset () {}
}
