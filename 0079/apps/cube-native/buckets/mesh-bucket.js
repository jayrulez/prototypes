import * as mat from '../matrix.js'
import { initShader } from '../helpers.js'
import { LIGHT_POS } from '../consts.js'

const [x, y, z] = LIGHT_POS

const vertexShader = `
precision highp float;
attribute vec4 pos;
attribute vec4 color;
attribute vec3 vertexNormal;

uniform vec3 viewPos;
uniform mat4 modelMat;
uniform mat4 viewMat;
uniform mat4 projectionMat;
uniform mat4 normalMat;

varying vec4 vColor;
varying vec3 vLighting;

void main() {
  vec4 transformedNormal = normalMat * vec4(vertexNormal, 1.0);

  float ambientStrength = 1.0;
  vec3 ambientColor = vec3(0.3, 0.3, 0.3);
  vec3 ambient = ambientColor * ambientStrength;

  float diffuseStrength = 0.8;
  vec3 diffuseColor = vec3(1, 1, 1);
  vec3 diffuseDir = normalize(vec3(1, 0, 0.75));
  float diffuseFactor = max(dot(transformedNormal.xyz, diffuseDir), 0.0);
  vec3 diffuse = diffuseColor * diffuseFactor * diffuseStrength;

  vec3 fragPos = vec3(modelMat * pos);
  vec3 specularLightPos = vec3(${x}, ${y}, ${z});
  // vec3 specularLightPos = viewPos;
  vec3 specularLightDir = normalize(specularLightPos - fragPos);

  float specularStrength = 0.5;
  vec3 specularColor = vec3(1, 1, 1);
  vec3 viewDir = normalize(viewPos - fragPos);
  vec3 reflectDir = reflect(-specularLightDir, vec3(transformedNormal));
  float specularFactor = pow(max(dot(viewDir, reflectDir), 0.0), 64.0);
  vec3 specular = specularColor * specularFactor * specularStrength;

  vColor = color;
  vLighting = ambient + diffuse + specular;
  gl_Position = projectionMat * viewMat * modelMat * pos;
}
`

const fragmentShader = `
precision highp float;
varying vec4 vColor;
varying vec3 vLighting;

void main() {
  gl_FragColor = vec4(vColor.rgb * vLighting, 1.0);
}
`

export const initProgramInfo = gl => {
  const program = initShader(gl, vertexShader, fragmentShader)
  return {
    program,
    attribLocations: {
      pos: gl.getAttribLocation(program, 'pos'),
      color: gl.getAttribLocation(program, 'color'),
      vertexNormal: gl.getAttribLocation(program, 'vertexNormal')
    },
    uniformLocations: {
      viewPos: gl.getUniformLocation(program, 'viewPos'),
      modelMat: gl.getUniformLocation(program, 'modelMat'),
      viewMat: gl.getUniformLocation(program, 'viewMat'),
      projectionMat: gl.getUniformLocation(program, 'projectionMat'),
      normalMat: gl.getUniformLocation(program, 'normalMat')
    }
  }
}

export const initBuffers = (gl, createData) => {
  const { positions, colors, indices, normals } = createData()

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  const colorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)

  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW
  )

  const normalBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW)

  return {
    normal: normalBuffer,
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
    length: indices.length
  }
}

export const draw = (gl, mats, programInfo, buffers, options) => {
  const { delta, camera } = options
  gl.useProgram(programInfo.program)

  const posX = Math.sin(delta) * 2
  const posY = Math.cos(delta) * 2 - 2

  const modelMat = mat.create()
  mat.translate(modelMat, modelMat, [posX, posY, 0])
  mat.rotate(modelMat, modelMat, delta, [1, 1, 0])

  const [viewMat, projectionMat] = mats

  const normalMat = mat.create()
  mat.invert(normalMat, modelMat)
  mat.transpose(normalMat, normalMat)

  const { pos } = programInfo.attribLocations
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
  gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(pos)

  // const { vertexNormal } = programInfo.attribLocations
  // gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal)
  // gl.vertexAttribPointer(vertexNormal, 3, gl.FLOAT, false, 0, 0)
  // gl.enableVertexAttribArray(vertexNormal)

  // const { color } = programInfo.attribLocations
  // gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color)
  // gl.vertexAttribPointer(color, 4, gl.FLOAT, false, 0, 0)
  // gl.enableVertexAttribArray(color)

  const { uniformLocations } = programInfo
  // gl.uniform3fv(uniformLocations.viewPos, camera)
  gl.uniformMatrix4fv(uniformLocations.modelMat, false, modelMat)
  gl.uniformMatrix4fv(uniformLocations.viewMat, false, viewMat)
  gl.uniformMatrix4fv(uniformLocations.projectionMat, false, projectionMat)
  // gl.uniformMatrix4fv(uniformLocations.normalMat, false, normalMat)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices)
  gl.drawElements(gl.TRIANGLES, buffers.length, gl.UNSIGNED_SHORT, 0)
}
