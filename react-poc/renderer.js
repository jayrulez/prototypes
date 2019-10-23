import Reconciler from 'react-reconciler/cjs/react-reconciler.development.js'
import { createNativeInstance, getHostContextNode } from './native-adapter.js'

const hostConfig = {
  appendInitialChild (parentInstance, child) {
    // FIXME
    console.log(111111, parentInstance, child)
    if (parentInstance.appendChild) {
      parentInstance.appendChild(child)
    }
  },
  appendChildToContainer (parent, stateNode) {

  },
  appendChild (parent, stateNode) {

  },
  createInstance (type, props, internalInstanceHandle) {
    return createNativeInstance(type, props)
  },
  createTextInstance (text, rootContainerInstance, internalInstanceHandle) {
    return text
  },
  finalizeInitialChildren (wordElement, type, props) {
    return false
  },
  getPublicInstance (instance) {
    return instance
  },
  now: Date.now,
  prepareForCommit () {
    // noop
  },
  prepareUpdate (wordElement, type, oldProps, newProps) {
    return true
  },
  resetAfterCommit () {
    // noop
  },
  resetTextContent (wordElement) {
    // noop
  },
  getRootHostContext (instance) {
    return getHostContextNode(instance)
  },
  getChildHostContext (instance) {
    return {}
  },
  shouldSetTextContent (type, props) {
    return false
  },
  useSyncScheduling: true,
  supportsMutation: true
}

// Singleton
const reconciler = Reconciler(hostConfig)
const nativeContainer = createNativeInstance('SCREEN')
const container = reconciler.createContainer(nativeContainer, false)

export default {
  render (reactElement) {
    return reconciler.updateContainer(reactElement, container)
  }
}
