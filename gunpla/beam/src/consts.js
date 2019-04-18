export const ShaderTypes = {
  vec4: 0,
  vec3: 1,
  vec2: 2,
  float: 3,
  mat4: 5,
  mat3: 6,
  mat2: 7,
  sampler2D: 8,
  samplerCube: 9
}

export const PropTypes = {
  buffer: 0,
  texture: 1,
  // FIXME remove uniform type
  uniform: 2
}

export const RendererConfig = {
  bufferChunkSize: 100 * 1024
}
