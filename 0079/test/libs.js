export class ShadePlugin {
  constructor () {
    this.programSchema = {
      vertexShader: '',
      fragmentShader: '',
      attributes: {},
      uniforms: {}
    }
    this.elementSchema = {}
  }

  createKey (element) {
    return null
  }

  createBufferProps (element) {
    return null
  }

  createTextureProps (element) {
    return []
  }

  configBuffers (gl, buffers) {

  }

  configTextures (gl, textures) {

  }

  configUniforms (gl, global) {

  }

  beforeDraw (gl) {

  }
}

export class Beam {

}
