/* eslint-env browser */

import {
  Element,
  ShadePlugin,
  ShaderTypes,
  BufferTypes,
  ResourceTypes
} from '../../src/index.js'

const push = (arr, x) => { arr[arr.length] = x }

const vertexShader = `
attribute vec4 pos;

uniform mat4 viewMat;
uniform mat4 projectionMat;

varying highp vec2 vTexCoord;

void main() {
  gl_Position = projectionMat * viewMat * pos;
  // vTexCoord = texCoord;
  vTexCoord = vec2(0, 0);
}
`

const fragmentShader = `
uniform sampler2D img;
varying highp vec2 vTexCoord;

void main() {
  gl_FragColor = vec4(1, 1, 1, 1);
}
`

export class ImagePlugin extends ShadePlugin {
  constructor () {
    super()

    const { vec3, mat4, sampler2D } = ShaderTypes
    this.programSchema.vertexShader = vertexShader
    this.programSchema.fragmentShader = fragmentShader
    this.programSchema.attributes = {
      pos: vec3
    }
    this.programSchema.uniforms = {
      viewMat: mat4,
      projectionMat: mat4,
      img: sampler2D
    }

    const { float, int } = BufferTypes
    this.bufferSchema = {
      pos: { type: float, n: 3 },
      index: { type: int, index: true }
    }

    // TODO fallback / config / fbo support
    const { texture } = ResourceTypes
    this.resourceSchema = {
      img: { type: texture }
    }
  }

  createBufferProps ({ state }) {
    const p = state.position
    const basePositions = [
      -1.0, -1.0, 1.0,
      1.0, -1.0, 1.0,
      1.0, 1.0, 1.0,
      -1.0, 1.0, 1.0
    ]
    const pos = []
    for (let i = 0; i < basePositions.length; i += 3) {
      push(pos, basePositions[i] + p[0])
      push(pos, basePositions[i + 1] + p[1])
      push(pos, basePositions[i + 2] + p[2])
    }
    return { pos, index: [0, 1, 2, 0, 2, 3] }
  }

  createUniformPropsByElement ({ state }) {
    return { img: state.img }
  }

  createUniformPropsByGlobal (globals) {
    return {
      viewMat: globals.camera,
      projectionMat: globals.perspective
    }
  }
}

export class ImageElement extends Element {
  constructor (state) {
    super(state)
    this.plugins = { ImagePlugin }
  }
}

export const loadImage = url => new Promise(resolve => {
  const image = new Image()
  image.onload = () => resolve(image)
  image.src = url
})
