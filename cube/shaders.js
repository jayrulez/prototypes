export const vertexShader = `
attribute vec4 pos;
attribute vec4 color;

uniform mat4 modelView;
uniform mat4 projection;

varying lowp vec4 vColor;

void main() {
  gl_Position = projection * modelView * pos;
  vColor = color;
}
`

export const fragmentShader = `
precision highp float;
varying vec4 vColor;

void main() {
  float ambientFactor = 0.3;
  vec3 lightColor = vec3(1.0, 0.8, 0.8);
  vec3 ambientColor = ambientFactor * lightColor;
  gl_FragColor = vec4(ambientColor, 1) * vColor;
}
`
