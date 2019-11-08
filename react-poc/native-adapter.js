
const FPS = 30
const mainLoop = async (onTick, delay = 1000 / FPS) => {
  const nativeTick = () => new Promise(resolve => {
    onTick()
    setTimeout(resolve, delay)
  })
  while (true) await nativeTick()
}

class NativeRenderer {
  constructor () {
    this.elements = []
    this.synced = true
    mainLoop(() => this.onFrameTick())
  }

  appendElement (element) {
    this.synced = false
    this.elements.push(element)
  }

  onFrameTick () {
    // console.log('Native frame tick!')
    if (!this.synced) {
      // console.log('should render native frame!')
      this.render()
    }
    this.synced = true
  }

  render () {
    for (let i = 0; i < this.elements.length; i++) {
      console.log(JSON.stringify(this.elements[i].props))
    }
  }
}

class NativeTextElement {
  constructor (props) {
    this.props = props
    this.parent = null
  }
}

class NativePixelElement {
  constructor (props) {
    this.props = props
    this.parent = null
  }
}

export const createNativeInstance = (type, props) => {
  if (type === 'SCREEN') {
    const renderer = new NativeRenderer()
    // window.renderer = renderer // browser debug
    return renderer
  } else if (type === 'TEXT') {
    return new NativeTextElement(props)
  } else if (type === 'PIXEL') {
    return new NativePixelElement(props)
  } else {
    console.warn(`Component type: ${type} is not supported`)
  }
}

let RootNodeInstance

export const getHostContextNode = rootNode => {
  if (rootNode) RootNodeInstance = rootNode
  else {
    console.warn(`${rootNode} is not an valid root instance.`)
    RootNodeInstance = new NativeRenderer()
  }
  return RootNodeInstance
}

export const appendNativeElement = (renderer, stateNode) => {
  stateNode.parent = renderer
  renderer.appendElement(stateNode)
}

export const updateNativeElement = (element, newProps) => {
  element.props = newProps
  element.parent.synced = false
}
