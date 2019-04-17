/* eslint-env browser */

const fetchGLTF = src => fetch(src).then(resp => resp.json())

const fetchBin = src => fetch(src).then(resp => resp.arrayBuffer())

const loadImage = src => new Promise(resolve => {
  const image = new Image()
  image.onload = () => resolve(image)
  image.src = src
})

const fetchBufferInfos = (
  binPath, attributeInfos, indicesInfo
) => new Promise(resolve => {
  fetchBin(binPath).then(buffer => {
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
})

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

export const loadGLTF = (src, basePath) => {
  return fetchGLTF(src).then(gltf => {
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
    const binPath = basePath + indicesInfo.uri

    window.gltf = gltf // for debug

    return Promise.all([
      fetchBufferInfos(binPath, attributeInfos, indicesInfo),
      Promise.all(gltf.images.map(({ uri }) => loadImage(basePath + uri)))
    ])
  })
}
