// TODO dynamic load render modules
import { initProgramInfo as initCubeProgramInfo } from './programs/cube.js'
import { initProgramInfo as initGridProgramInfo } from './programs/grid.js'
import { initBuffers as initCubeBuffers } from './buffers/cube.js'
import { initBuffers as initGridBuffers } from './buffers/grid.js'

import { elementsToTasks } from './tasks/index.js'
import {
  drawTask, draw, createProjectionMat, createViewMat
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
    const tasks = elementsToTasks(this.elements, this.camera)
    const { gl, taskResources } = this
    tasks.forEach((task) => drawTask(task, gl, taskResources))

    // FIXME legacy draw
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const { clientWidth, clientHeight } = gl.canvas
    const viewMat = createViewMat(this.camera)
    const projectionMat = createProjectionMat(clientWidth, clientHeight)
    const mats = [viewMat, projectionMat]

    const programInfos = [
      taskResources['Cube'].programInfo,
      taskResources['RefGrid'].programInfo
    ]

    const buffers = [
      taskResources['Cube'].buffers,
      taskResources['RefGrid'].buffers
    ]

    draw(gl, mats, programInfos, buffers)
    this.elements = []
  }
}
