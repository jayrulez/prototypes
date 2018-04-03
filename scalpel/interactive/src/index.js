import { App } from './app'

const stageConf = {
  container: 'container',
  width: 640,
  height: 480
}
const layerConf = {}
const lineConf = {
  stroke: 'black',
  points: [],
  bezier: true,
  tension: 0.5
}

// main(stageConf, layerConf, lineConf)
void new App(stageConf, layerConf, lineConf)
