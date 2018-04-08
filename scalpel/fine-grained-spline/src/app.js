import { FlexLine } from './flex-line'
import { initStage, initLayer } from './conf'

export class App {
  stage = initStage()
  layer = initLayer()
  flexLines = []

  constructor () {
    window.app = this
    this.bindStageEvents()
    this.stage.add(this.layer)
  }

  bindStageEvents = () => {
    this.stage.on('click', () => {
      const { x, y } = this.stage.getPointerPosition()
      const flexLine = new FlexLine(this)
      flexLine.addPoint(x, y)
      this.flexLines.push(flexLine)
    })
  }
}
