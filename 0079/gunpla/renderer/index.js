import * as mat from '../utils/math/matrix.js'

// TODO dynamic load render modules
import { initProgramInfo as initCubeProgramInfo } from './programs/cube.js'
import { initProgramInfo as initGridProgramInfo } from './programs/grid.js'
import { initBuffers as initCubeBuffers } from './buffers/cube.js'
import { initBuffers as initGridBuffers } from './buffers/grid.js'

import { elementsToTasks } from './tasks/index.js'
import {
  drawCube, drawGrid, createProjectionMat, createViewMat
} from './draw/index.js'

export default class Renderer {
  constructor (canvas) {
    const gl = canvas.getContext('webgl')
    this.camera = {
      position: [0, 0, 0],
      target: [0, 0, 0],
      up: [0, 1, 0]
    }

    this.taskResources = {
      Cube: {
        programInfo: initCubeProgramInfo(gl),
        buffers: initCubeBuffers(gl)
      },
      RefGrid: {
        programInfo: initGridProgramInfo(gl),
        buffers: initGridBuffers(gl)
      }
    }

    this.gl = gl
    this.elements = []
  }

  commitCamera (camera) {
    this.camera = camera
  }

  commitElement (element) {
    this.elements.push(element)
  }

  render () {
    // Task has same shape as element for now
    const tasks = elementsToTasks(this.elements)
    const { gl, taskResources } = this

    // FIXME legacy draw
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const { clientWidth, clientHeight } = gl.canvas
    const viewMat = createViewMat(this.camera)
    const projectionMat = createProjectionMat(clientWidth, clientHeight)

    window.tasks = tasks
    const [gridTasks, cubeTasks] = tasks

    const programInfos = [
      taskResources['RefGrid'].programInfo,
      taskResources['Cube'].programInfo
    ]

    const buffers = [
      taskResources['RefGrid'].buffers,
      taskResources['Cube'].buffers
    ]

    for (let i = 0; i < gridTasks.length; i++) {
      const { position, transform } = gridTasks[i]
      const modelMat = mat.create()
      mat.translate(modelMat, modelMat, position)
      if (transform) mat.multiply(modelMat, modelMat, transform)
      const mats = [modelMat, viewMat, projectionMat]

      drawGrid(gl, mats, programInfos[0], buffers[0])
    }

    for (let i = 0; i < cubeTasks.length; i++) {
      const { position, transform } = cubeTasks[i]
      const modelMat = mat.create()
      mat.translate(modelMat, modelMat, position)
      if (transform) mat.multiply(modelMat, modelMat, transform)
      const mats = [modelMat, viewMat, projectionMat]

      drawCube(gl, mats, programInfos[1], buffers[1])
    }

    this.elements = []
  }
}
