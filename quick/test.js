const findId = (node, id) => {
  if (node.id === id) return node
  let result = null
  for (let i = 0; i < node.children.length; i++) {
    result = findId(node.children[i], id)
    if (result) return result
  }
  return null
}

const data = {
  id: 0,
  value: 'a',
  children: [
    { id: 1, value: 'b', children: [] },
    { id: 2, value: 'c', children: [] },
    { id: 3, value: 'd', children: [] },
    { id: 4, value: 'e', children: [] }
  ]
}

const node = findId(data, 2)
console.log(node.id)
