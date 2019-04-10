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

    const { attribute, uniform } = PropTypes
    // TODO uniform fallback / config / fbo support
    this.propSchema = {
      pos: { type: attribute, n: 3 },
      index: { type: attribute, index: true },
      img: { type: uniform }
    }
  }

  propsByElement ({ props }) {
    const p = props.position
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
    return { pos, index: [0, 1, 2, 0, 2, 3], img: props.img }
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

export const loadImage = url => new Promise(resolve => {
  const image = new Image()
  image.onload = () => resolve(image)
  image.src = url
})
