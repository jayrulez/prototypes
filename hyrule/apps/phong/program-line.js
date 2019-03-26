import { initShader } from '../../libs/graphics/shader-utils.js'

const vertexShader = `
precision highp float;

attribute vec4 pos;

uniform mat4 modelMat;
uniform mat4 viewMat;
uniform mat4 projectionMat;

void main() {
  gl_Position = projectionMat * viewMat * modelMat * pos;
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
      modelMat: gl.getUniformLocation(program, 'modelMat'),
      viewMat: gl.getUniformLocation(program, 'viewMat'),
      projectionMat: gl.getUniformLocation(program, 'projectionMat'),
      color: gl.getUniformLocation(program, 'color')
    }
  }
}
