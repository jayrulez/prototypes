import {
  Element,
  ShadePlugin,
  ShaderTypes,
  PropTypes
} from '../../src/index.js'
import { create } from '../common/mat4.js'

const vertexShader = `
attribute vec4 pos;
attribute vec4 normal;

uniform mat4 viewMat;
uniform mat4 projectionMat;
uniform mat4 normalMat;

varying highp vec4 vColor;

void main() {
  vec4 color = vec4(1, 0, 0, 1);
  vec3 lightDir = vec3(-0.35, 0.35, 0.87);
  vec3 normalDir = normalize(vec3(normalMat * normal));
  float nDotL = max(dot(normalDir, lightDir), 0.0);
  vColor = vec4(color.rgb * nDotL, color.a);
  gl_Position = projectionMat * viewMat * pos;
}
`

const fragmentShader = `
varying highp vec4 vColor;

void main() {
  gl_FragColor = vColor;
}
`

export class MeshPlugin extends ShadePlugin {
  constructor () {
    super()

    const { vec3, vec4, mat4 } = ShaderTypes
    this.programSchema.vertexShader = vertexShader
    this.programSchema.fragmentShader = fragmentShader
    this.programSchema.attributes = {
      pos: vec3,
      normal: vec4
    }
    this.programSchema.uniforms = {
      viewMat: mat4,
      projectionMat: mat4,
      normalMat: mat4
    }

    const { attribute } = PropTypes
    this.propSchema = {
      pos: { type: attribute, n: 3 },
      normal: { type: attribute, n: 3 },
      index: { type: attribute, index: true }
    }
  }

  propsByElement ({ props }) {
    const { attributeInfos, indicesInfo } = props.bufferInfos
    // debugger
    return {
      pos: attributeInfos[1].data,
      normal: attributeInfos[0].data,
      index: indicesInfo.data
    }
  }

  propsByGlobals (globals) {
    return {
      normalMat: create(),
      viewMat: globals.camera,
      projectionMat: globals.perspective
    }
  }
}

export class MeshElement extends Element {
  constructor (props) {
    super(props)
    this.plugins = { MeshPlugin }
  }
}
