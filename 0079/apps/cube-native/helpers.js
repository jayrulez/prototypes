import * as mat from './matrix.js'
import { ANIMATE, CAMERA_BASE, ROTATE_DELTA_BASE } from './consts.js'

let ts = Date.now()
export const getDelta = () => ANIMATE
  ? (Date.now() - ts) / 1000 : ROTATE_DELTA_BASE

export const createProjectionMat = (width, height) => {
  const fov = Math.PI / 6
  const aspect = width / height
  const projectionMat = mat.create()
  return mat.perspective(projectionMat, fov, aspect, 0.1, 1000.0)
}

export const getCamera = (dX, dY) => {
  const [x, y, z] = CAMERA_BASE
  return [-dX * 30 + x, -dY * 30 + y, z]
}

export const createViewMat = ([dX, dY]) => {
  const viewMat = mat.create()
  const camera = getCamera(dX, dY)
  return mat.lookAt(viewMat, camera, [0, 0, 0], [0, 1, 0])
}

const compileShader = (gl, type, source) => {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Error compiling shaders', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export const initShader = (gl, vsSource, fsSource) => {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource)
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource)

  const shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Error init program', gl.getProgramInfoLog(shaderProgram))
    return null
  }

  return shaderProgram
}

const isMobile = window.orientation > -1
const [E_START, E_MOVE, E_END] = isMobile
  ? ['touchstart', 'touchmove', 'touchend']
  : ['mousedown', 'mousemove', 'mouseup']
const clamp = (x, lower, upper) => Math.max(Math.min(x, upper), lower)

let [percentX, percentY] = [0, 0]

export const initDrag = (canvas, onDrag) => {
  canvas.addEventListener(E_START, e => {
    e.preventDefault()
    const _e = isMobile ? e.touches[0] : e
    const [baseX, baseY] = [_e.clientX, _e.clientY]
    const [_percentX, _percentY] = [percentX, percentY]

    const onMove = e => {
      const _e = isMobile ? e.touches[0] : e
      const [moveX, moveY] = [_e.clientX, _e.clientY]
      const baseSize = document.body.clientWidth / 2
      percentX = clamp((moveX - baseX) / baseSize + _percentX, -1, 1)
      percentY = clamp((moveY - baseY) / baseSize + _percentY, -1, 1)

      onDrag(percentX, percentY)
    }
    const onEnd = e => {
      document.removeEventListener(E_MOVE, onMove)
      document.removeEventListener(E_END, onEnd)
    }
    document.addEventListener(E_MOVE, onMove)
    document.addEventListener(E_END, onEnd)
  })
}
