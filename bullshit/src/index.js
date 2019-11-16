import AggressivePureRenderer from './objects/aggressive-pure-renderer.js'
import Interpreter from './runtime/interpreter.js'
import StateMachine from './runtime/state-machine.js'
import Bytecode from './runtime/bytecode.js'

export default function bullshit () {
  const aggressivePureRenderer = new AggressivePureRenderer()
  const stateMachine = new StateMachine()
  const interpreter = new Interpreter(aggressivePureRenderer, stateMachine)
  return interpreter.execute(Bytecode)
}
