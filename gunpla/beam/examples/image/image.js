/* eslint-env browser */

import {
  Element,
  ShadePlugin,
  ShaderTypes,
  PropTypes
} from '../../src/index.js'

const push = (arr, x) => { arr[arr.length] = x }

const vertexShader = `
attribute vec4 pos;
attribute vec2 texCoord;

uniform mat4 viewMat;
uniform mat4 projectionMat;

varying highp vec2 vTexCoord;

void main() {
  gl_Position = projectionMat * viewMat * pos;
  vTexCoord = texCoord;
}
`

const fragmentShader = `
uniform sampler2D imgA;
uniform sampler2D imgB;
varying highp vec2 vTexCoord;

void main() {
  highp vec4 colorA = texture2D(imgA, vTexCoord);
  highp vec4 colorB = texture2D(imgB, vTexCoord);
  gl_FragColor = colorA * colorB;
}
`

export class ImagePlugin extends ShadePlugin {
  constructor () {
    super()

    const { vec2, vec3, mat4, sampler2D } = ShaderTypes
    this.vertexShader = vertexShader
    this.fragmentShader = fragmentShader
    this.shaderSchema.attributes = {
      pos: vec3,
      texCoord: vec2
    }
    this.shaderSchema.uniforms = {
      viewMat: mat4,
      projectionMat: mat4,
      imgA: sampler2D,
      imgB: sampler2D
    }

    const { buffer, texture } = PropTypes
    // TODO uniform fallback / config / fbo support
    this.propSchema = {
      pos: { type: buffer, n: 3 },
      texCoord: { type: buffer, n: 2 },
      index: { type: buffer, index: true },
      imgA: { type: texture, unit: 0 },
      imgB: { type: texture, unit: 1 }
    }
  }

  propsByElement ({ props }) {
    const p = props.position
    const r = props.aspectRatio || 1
    const basePositions = [
      -1.0, -1.0 * r, 1.0,
      1.0, -1.0 * r, 1.0,
      1.0, 1.0 * r, 1.0,
      -1.0, 1.0 * r, 1.0
    ]
    const texCoord = [
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0
    ]
    const pos = []
    for (let i = 0; i < basePositions.length; i += 3) {
      push(pos, basePositions[i] + p[0])
      push(pos, basePositions[i + 1] + p[1])
      push(pos, basePositions[i + 2] + p[2])
    }
    return {
      pos,
      texCoord,
      index: [0, 1, 2, 0, 2, 3],
      imgA: props.imgA,
      imgB: props.imgB
    }
  }

  propsByGlobals (globals) {
    return {
      viewMat: globals.camera,
      projectionMat: globals.perspective
    }
  }
}

export class ImageElement extends Element {
  constructor (props) {
    super(props)
    this.plugins = { ImagePlugin }
  }
}

const loadImage = url => new Promise(resolve => {
  const image = new Image()
  image.onload = () => resolve(image)
  image.src = url
})

export const loadImages = urls => Promise.all(urls.map(loadImage))
