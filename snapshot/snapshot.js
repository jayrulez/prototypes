export class Snapshot {
  constructor (options = {}) {
    const { rules = [] } = options
    this.$index = 0
    this.$states = []
    this.rules = rules
  }

  get hasUndo () {
    return false
  }

  get hasRedo () {
    return false
  }

  push () {}

  undo () {}

  redo () {}

  reset () {}
}
