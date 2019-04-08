import { App } from './app'

const stageConf = {
  container: 'container',
  width: 640,
  height: 480
}
const layerConf = {}
const lineConf = {
  stroke: '#666',
  points: [],
  bezier: true,
  tension: 0.5
}

void new App(stageConf, layerConf, lineConf)
