/* eslint-env browser */
import { mat4 } from '../gl-matrix-min'

let delta = 0

// Wrap render function with extra delta args.
export function render (gl, programInfo, buffers, texture) {
  requestAnimationFrame(() => {
    delta += 0.01
    renderFrame(gl, programInfo, buffers, texture, delta)
    render(gl, programInfo, buffers, texture)
  })
}

// Draw the scene with extra delta args.
function renderFrame (gl, programInfo, buffers, texture, delta) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0) // Clear to black, fully opaque
  gl.clearDepth(1.0) // Clear everything
  gl.enable(gl.DEPTH_TEST) // Enable depth testing
  gl.depthFunc(gl.LEQUAL) // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.
  const fieldOfView = 45 * Math.PI / 180 // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
  const zNear = 0.1
  const zFar = 100.0
  const projectionMatrix = mat4.create()

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(
    projectionMatrix,
    fieldOfView,
    aspect,
    zNear,
    zFar
  )

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create()

  // Now move the drawing position a bit to where we want to
  // start drawing the square.
  mat4.translate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to translate
    [-0.0, 0.0, -5.0] // amount to translate
  )

  // Rotate the square by rotating view matrix.
  mat4.rotate(
    modelViewMatrix,
    modelViewMatrix,
    delta * 0.7,
    [0, 1, 1]
  )

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  {
    const numComponents = 3
    const type = gl.FLOAT
    const normalize = false
    const stride = 0
    const offset = 0
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    )
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
  }

  // Tell WebGL how to pull out the colors from the color
  // buffer into the vertexColor attribute.
  {
    const num = 2 // every coordinate composed of 2 values
    const type = gl.FLOAT // the data in the buffer is 32 bit float
    const normalize = false // don't normalize
    const stride = 0 // how many bytes to get from one set to the next
    const offset = 0 // how many bytes inside the buffer to start from

    const textureCoord = programInfo.attribLocations.textureCoord
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord)
    gl.vertexAttribPointer(
      textureCoord, num, type, normalize, stride, offset
    )
    gl.enableVertexAttribArray(textureCoord)
  }

  // Tell WebGL to use our program when drawing.
  gl.useProgram(programInfo.program)

  // Set the shader uniforms.
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  )
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  )

  {
    // Draw elements instead of array buffer.
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices)
    const offset = 0
    const type = gl.UNSIGNED_SHORT
    const vertexCount = 36

    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0)
    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture)
    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0)

    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
  }
}