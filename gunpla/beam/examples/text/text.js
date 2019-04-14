import {
  Element,
  ShadePlugin,
  ShaderTypes,
  PropTypes
} from '../../src/index.js'

const vertexShader = `
attribute vec4 pos;
// attribute vec4 color;

uniform mat4 viewMat;
uniform mat4 projectionMat;

varying highp vec4 vColor;

void main() {
  gl_Position = projectionMat * viewMat * pos;
  vColor = vec4(1, 0, 0, 1);
}
`

const fragmentShader = `
varying highp vec4 vColor;

void main() {
  gl_FragColor = vColor;
}
`

export class TextPlugin extends ShadePlugin {
  constructor () {
    super()

    const { vec3, mat4 } = ShaderTypes
    this.programSchema.vertexShader = vertexShader
    this.programSchema.fragmentShader = fragmentShader
    this.programSchema.attributes = { pos: vec3 }
    this.programSchema.uniforms = {
      viewMat: mat4,
      projectionMat: mat4
    }

    const { attribute } = PropTypes
    this.propSchema = {
      pos: { type: attribute, n: 3 },
      index: { type: attribute, index: true }
    }
  }

  propsByElement ({ props }) {
    const { positions, indices } = props
    return { pos: positions, index: indices }
  }

  propsByGlobals (globals) {
    return {
      viewMat: globals.camera,
      projectionMat: globals.perspective
    }
  }
}

export class TextElement extends Element {
  constructor (props) {
    super(props)
    this.plugins = { TextPlugin }
  }
}
