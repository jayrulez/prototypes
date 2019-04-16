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
attribute vec2 texCoord;

uniform mat4 viewMat;
uniform mat4 projectionMat;
uniform mat4 normalMat;

varying highp vec3 vLighting;
varying highp vec2 vTexCoord;

void main() {
  vec4 color = vec4(1, 1, 1, 1);
  vec3 lightDir = vec3(-0.35, 0.35, 0.87);
  vec3 normalDir = normalize(vec3(normalMat * normal));
  float nDotL = max(dot(normalDir, lightDir), 0.0);
  vLighting = color.rgb * nDotL;
  vTexCoord = texCoord;
  gl_Position = projectionMat * viewMat * pos;
}
`

const fragmentShader = `
uniform sampler2D img;
varying highp vec2 vTexCoord;
varying highp vec3 vLighting;

void main() {
  highp vec4 texelColor = texture2D(img, vTexCoord);
  gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
}
`

export class MeshPlugin extends ShadePlugin {
  constructor () {
    super()

    const { vec2, vec3, vec4, mat4, sampler2D } = ShaderTypes
    this.programSchema.vertexShader = vertexShader
    this.programSchema.fragmentShader = fragmentShader
    this.programSchema.attributes = {
      texCoord: vec2,
      pos: vec3,
      normal: vec4
    }
    this.programSchema.uniforms = {
      viewMat: mat4,
      projectionMat: mat4,
      normalMat: mat4,
      img: sampler2D
    }

    const { attribute, uniform } = PropTypes
    this.propSchema = {
      pos: { type: attribute, n: 3 },
      normal: { type: attribute, n: 3 },
      texCoord: { type: attribute, n: 2 },
      index: { type: attribute, index: true },
      img: { type: uniform }
    }
  }

  propsByElement ({ props }) {
    const { attributeInfos, indicesInfo } = props.bufferInfos
    return {
      pos: attributeInfos[1].data,
      normal: attributeInfos[0].data,
      texCoord: attributeInfos[2].data,
      index: indicesInfo.data,
      img: props.image
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
