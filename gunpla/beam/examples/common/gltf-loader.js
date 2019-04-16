/* eslint-env browser */

const fetchGLTF = src => fetch(src).then(resp => resp.json())

const fetchBuffer = src => fetch(src).then(resp => resp.arrayBuffer())

// const defined = field => field !== undefined && field !== null

const initBufferInfo = (gltf, bufferName, accessorName) => {
  const accessor = gltf.accessors[accessorName]
  const bufferView = gltf.bufferViews[accessor.bufferView]
  const buffer = gltf.buffers[bufferView.buffer]
  return {
    bufferName,
    accessorName,
    accessor,
    bufferView,
    buffer,
    uri: buffer.uri,
    data: null
  }
}

export const loadGLTF = (src, basePath) => new Promise((resolve) => {
  fetchGLTF(src).then(gltf => {
    const mesh = gltf.meshes[0]
    const primitive = mesh.primitives[0]
    const { attributes } = primitive

    const attributeInfos = Object.keys(attributes).map(attributeName => {
      // attributeName: 'POSITION', 'NORMAL', 'TEXCOORD_0'...
      // accessorName: 0, 1, 2...
      const accessorName = attributes[attributeName]
      return initBufferInfo(gltf, attributeName, accessorName)
    })
    const indicesInfo = initBufferInfo(gltf, 'INDEX', primitive.indices)
    const bufferPath = basePath + indicesInfo.uri

    fetchBuffer(bufferPath).then(buffer => {
      attributeInfos.forEach(attributeInfo => {
        const { byteOffset, byteLength } = attributeInfo.bufferView
        attributeInfo.data = buffer.slice(byteOffset, byteOffset + byteLength)
      })
      const { byteOffset, byteLength } = indicesInfo.bufferView
      indicesInfo.data = buffer.slice(byteOffset, byteOffset + byteLength)
      resolve({
        attributeInfos,
        indicesInfo
      })
    })

    window.gltf = gltf
  })
})
