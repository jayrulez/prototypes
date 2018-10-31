import { hashFunc } from './hash'

const defaultRule = {
  // StateNode => Boolean
  match: node => true,
  // StateNode => { Chunks, Children }
  toRecord: node => ({
    chunks: [{ ...node, children: undefined }], children: node.children
  }),
  // { Chunks, Children } => StateNode
  fromRecord: ({ chunks, children }) => ({ ...chunks[0], children })
}

export const state2Record = (
  stateNode, chunkPool, rules, rootFilter
) => {
  const rule = rules.find(({ match }) => match(stateNode)) || defaultRule
  const { toRecord } = rule

  const { chunks, children } = toRecord(stateNode)
  const hashes = []
  for (let i = 0; i < chunks.length; i++) {
    const chunkStr = JSON.stringify(chunks[i])
    const hashKey = hashFunc(chunkStr)
    hashes.push(hashKey)
    chunkPool[hashKey] = chunkStr
  }

  return {
    hashes,
    rule,
    children: children && children.map(
      node => state2Record(node, chunkPool, rules, null)
    )
  }
}

export const record2State = (recordNode, chunkPool) => {
  const { hashes, rule: { fromRecord }, children } = recordNode
  const chunks = hashes.map(hash => JSON.parse(chunkPool[hash]))
  return fromRecord({
    chunks,
    children: children && children.map(node => record2State(node, chunkPool))
  })
}
