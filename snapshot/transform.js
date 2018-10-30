import { hashFunc } from './hash'

const defaultRule = {
  match: () => true,
  serialize: node => ({ ...node, children: undefined }),
  deserialize: node => node,
  getChildren: node => node.children
}

export const state2Hash = (
  stateNode, chunks, rules, rootFilter, isRoot
) => {
  const rule = rules.find(({ match }) => match(stateNode)) || defaultRule
  const { serialize, getChildren } = rule

  const sanitizedNode = serialize(stateNode)
  const chunk = JSON.stringify(sanitizedNode)
  const hashKey = hashFunc(chunk)
  chunks[hashKey] = chunk
  const hashNode = {
    hash: hashKey,
    rule,
    children: getChildren(stateNode)
      .map(node => state2Hash(node, chunks, rules, false))
  }
  return hashNode
}

export const hash2State = (
  hashNode, chunks, isRoot
) => {
  const { hash, children } = hashNode
  const stateNode = JSON.parse(chunks[hash])
  stateNode.children = children.map(node => hash2State(node, chunks))
  return stateNode
}
