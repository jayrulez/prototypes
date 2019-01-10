const fs = require('fs')
const { join, basename } = require('path')
const os = require('os')

const ensureRepeaterDir = () => {
  const repeaterDir = join(process.cwd(), './.repeater')
  if (!fs.existsSync(repeaterDir)) fs.mkdirSync(repeaterDir)
}

const getActionByJSON = (name, update) => {
  const jsonPath = join(process.cwd(), name)
  if (!fs.existsSync(jsonPath)) {
    return 'not-found'
  }

  if (update) {
    return 'update-single'
  }

  const screenshotPath = jsonPath.replace('.json', '.png')
  return fs.existsSync(screenshotPath) ? 'update-single' : 'test-single'
}

const getActionByDir = (name, update) => {
  // const dir = join(process.cwd(), name)
  return 'todo'
}

const getActionByName = (name, update) => {
  return name.includes('.json')
    ? getActionByJSON(name, update) : getActionByDir(name, update)
}

const getDefaultChromiumPath = () => {
  return os.platform() === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
}

const getJSONByPath = filePath => JSON.parse(fs.readFileSync(filePath, 'utf8'))

const getLogNameByPath = filePath => {
  return basename(filePath).replace('.json', '')
}

module.exports = {
  ensureRepeaterDir,
  getActionByName,
  getDefaultChromiumPath,
  getJSONByPath,
  getLogNameByPath
}
