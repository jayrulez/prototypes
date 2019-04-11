import {
  Element,
  ShadePlugin,
  ShaderTypes,
  PropTypes
} from '../../src/index.js'

const vertexShader = `
attribute vec4 pos;

void main() {
  gl_Position = pos;
}
`

// Inline from https://thebookofshaders.com/07/
const fragmentShader = `
precision highp float;

void main() {
  vec2 resolution = vec2(400, 400);

  vec2 st = gl_FragCoord.xy / resolution.xy;
  st.x *= resolution.x / resolution.y;
  vec3 color = vec3(0.0);
  float d = 0.0;

  // Remap the space to -1. to 1.
  st = st * 2.0 - 1.0;

  // Make the distance field
  d = length(abs(st) - 0.3);
  // d = length(min(abs(st) - 0.3, 0.0));
  // d = length(max(abs(st) - .3, 0.0));

  // Visualize the distance field
  gl_FragColor = vec4(vec3(fract(d * 10.0)), 0.2);
}
`

export class PostProcessingPlugin extends ShadePlugin {
  constructor () {
    super()

    const { vec3 } = ShaderTypes
    this.programSchema.vertexShader = vertexShader
    this.programSchema.fragmentShader = fragmentShader
    this.programSchema.attributes = { pos: vec3 }

    const { attribute } = PropTypes
    this.propSchema = {
      pos: { type: attribute, n: 3 },
      index: { type: attribute, index: true }
    }
  }

  propsByElement () {
    const pos = [
      -1.0, -1.0, 1.0,
      1.0, -1.0, 1.0,
      1.0, 1.0, 1.0,
      -1.0, 1.0, 1.0
    ]

    return { pos, index: [0, 1, 2, 0, 2, 3] }
  }

  propsByGlobals (globals) {
    return {

    }
  }

  beforeRender (gl) {
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
    gl.enable(gl.BLEND)
    gl.disable(gl.DEPTH_TEST)
  }
}

export class PostProcessingElement extends Element {
  constructor (props) {
    super(props)
    this.plugins = { PostProcessingPlugin }
  }
}
