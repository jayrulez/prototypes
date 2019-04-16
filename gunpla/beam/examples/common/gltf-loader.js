/* eslint-env browser */

const fetchGLTF = src => fetch(src).then(resp => resp.json())

// const defined = field => field !== undefined && field !== null

export const loadGLTF = src => new Promise((resolve) => {
  fetchGLTF(src).then(gltf => {
    const mesh = gltf.meshes[0]
    const primitive = mesh.primitives[0]
    const { attributes } = primitive

    const attributeInfos = Object.keys(attributes).map(attributeName => {
      // attributeName: 'POSITION', 'NORMAL', 'TEXCOORD_0'...
      // accessorName: 0, 1, 2...
      const accessorName = attributes[attributeName]
      const accessor = gltf.accessors[accessorName]
      const bufferView = gltf.bufferViews[accessor.bufferView]
      const buffer = gltf.buffers[bufferView.buffer]
      const { uri } = buffer
      return {
        attributeName,
        accessorName,
        accessor,
        bufferView,
        buffer,
        uri
      }
    })

    console.log(attributeInfos)
    window.gltf = gltf
  })
})
