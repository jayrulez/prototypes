import { initShader } from '../../libs/graphics/shader-utils.js'

const vertexShader = `
precision highp float;

attribute vec4 pos;
uniform mat4 modelViewMat;
uniform mat4 projectionMat;

void main() {
  gl_Position = projectionMat * modelViewMat * pos;
}
`

const fragmentShader = `
precision highp float;
uniform vec4 color;

void main() {
  gl_FragColor = color;
}
`

export const initProgramInfo = gl => {
  const program = initShader(gl, vertexShader, fragmentShader)
  return {
    program,
    attribLocations: {
      pos: gl.getAttribLocation(program, 'pos')
    },
    uniformLocations: {
      color: gl.getUniformLocation(program, 'color'),
      projectionMat: gl.getUniformLocation(program, 'projectionMat'),
      modelViewMat: gl.getUniformLocation(program, 'modelViewMat')
    }
  }
}
