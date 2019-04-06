import { ShadePlugin } from './libs.js'

export class CubePlugin extends ShadePlugin {
  constructor () {
    super()
    this.programSchema.vertexShader = ''
    this.programSchema.fragmentShader = ''
    this.programSchema.attributes = {}
    this.programSchema.uniforms = {}
    this.elementSchema = {}
  }
}
