export const ShaderTypes = {
  vec4: 0,
  vec3: 1,
  vec2: 2,
  float: 3,
  int: 4,
  mat4: 5,
  mat3: 6,
  mat2: 7,
  sampler2D: 8
}

export const BufferTypes = {
  float: 0,
  int: 1
}

export const ResourceTypes = {
  texture: 0,
  array: 1
}

export const RendererConfig = {
  bufferChunkSize: 100 * 1024
}
