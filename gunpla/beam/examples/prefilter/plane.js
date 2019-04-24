/* eslint-env browser */

import {
  createElement,
  ShadePlugin,
  ShaderTypes,
  PropTypes
} from '../../src/index.js'

const push = (arr, x) => { arr[arr.length] = x }

const vertexShader = `
attribute vec4 pos;
attribute vec2 texCoord;

varying highp vec2 vTexCoord;

void main() {
  gl_Position = vec4(pos.xy, 0, 1);
  vTexCoord = texCoord;
}
`

const fragmentShader = `
// uniform sampler2D img0;
// uniform sampler2D img1;
varying highp vec2 vTexCoord;

void main() {
  // highp vec4 colorA = texture2D(img0, vTexCoord);
  // highp vec4 colorB = texture2D(img1, vTexCoord);
  // gl_FragColor = colorA * colorB;
  gl_FragColor = vec4(1, 0, 0, 1);
}
`

export class PlanePlugin extends ShadePlugin {
  constructor () {
    super()

    const { vec2, vec3 } = ShaderTypes
    // const { vec2, vec3, mat4, sampler2D } = ShaderTypes
    this.vertexShader = vertexShader
    this.fragmentShader = fragmentShader
    this.shaderSchema.attributes = {
      pos: vec3,
      texCoord: vec2
    }
    this.shaderSchema.uniforms = {
      // img0: sampler2D,
      // img1: sampler2D
    }

    // const { buffer, texture } = PropTypes
    const { buffer } = PropTypes
    this.propSchema = {
      pos: { type: buffer, n: 2 },
      texCoord: { type: buffer, n: 2 },
      index: { type: buffer, index: true }
      // img0: { type: texture, unit: 0, flip: true },
      // img1: { type: texture, unit: 1, flip: true }
    }
  }

  propsByElement () {
    const basePositions = [
      -1.0, -1.0,
      1.0, -1.0,
      1.0, 1.0,
      -1.0, 1.0
    ]
    const texCoord = [
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0
    ]
    const pos = []
    for (let i = 0; i < basePositions.length; i += 3) {
      push(pos, basePositions[i])
      push(pos, basePositions[i + 1])
      push(pos, basePositions[i + 2])
    }
    return {
      pos,
      texCoord,
      index: [0, 1, 2, 0, 2, 3]
      // img0: state.img0,
      // img1: state.img1
    }
  }
}

export const createPlaneElement = data => createElement(data, PlanePlugin)

const loadImage = url => new Promise(resolve => {
  const image = new Image()
  image.onload = () => resolve(image)
  image.src = url
})

export const loadImages = urls => Promise.all(urls.map(loadImage))
