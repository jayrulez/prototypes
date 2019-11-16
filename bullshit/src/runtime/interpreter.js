class Interpreter {
  constructor (root, stateMachine) {
    this.root = root
    this.stateMachine = stateMachine
  }

  execute (Bytecode) {
    console.log(Bytecode)
  }
}

export default Interpreter
