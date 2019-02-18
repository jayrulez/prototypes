const os = require('os')

const getDefaultChromiumPath = () => {
  return os.platform() === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
}

module.exports = {
  getDefaultChromiumPath
}
