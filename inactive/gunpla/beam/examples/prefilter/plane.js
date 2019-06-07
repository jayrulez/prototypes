/* eslint-env browser */

import {
  createElement,
  ShadePlugin,
  ShaderTypes,
  PropTypes
} from '../../src/index.js'

const push = (arr, x) => { arr[arr.length] = x }

const vertexShader = `
attribute vec2 pos;
attribute vec2 texCoord;

varying highp vec2 vTexCoord;

void main() {
  gl_Position = vec4(pos, 0, 1);
  vTexCoord = texCoord;
}
`

const fragmentShader = `
uniform sampler2D img;
varying highp vec2 vTexCoord;

void main() {
  highp vec4 colorA = texture2D(img, vTexCoord);
  gl_FragColor = colorA;
}
`

export class PlanePlugin extends ShadePlugin {
  constructor () {
    super()

    const { vec2, sampler2D } = ShaderTypes
    this.vertexShader = vertexShader
    this.fragmentShader = fragmentShader
    this.shaderSchema.attributes = {
      pos: vec2,
      texCoord: vec2
    }
    this.shaderSchema.uniforms = {
      img: sampler2D
    }

    const { buffer, texture } = PropTypes
    this.propSchema = {
      pos: { type: buffer, n: 2 },
      texCoord: { type: buffer, n: 2 },
      index: { type: buffer, index: true },
      img: { type: texture, unit: 0, flip: true }
    }
  }

  propsByElement ({ state }) {
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
      index: [0, 1, 2, 0, 2, 3],
      img: state.img
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
