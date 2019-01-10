const puppeteer = require('puppeteer-core')
const os = require('os')
const { join } = require('path')
const genericPool = require('generic-pool')
const {
  ensureRepeaterDir,
  getJSONByPath,
  getLogNameByPath
} = require('./utils')

const wait = (delay) => new Promise((resolve) => {
  setTimeout(() => resolve(), delay)
})

// Run log JSON and save screenshot to repeater's tmp dir.
// Logs can have multi window sizes, so new browser instance is required.
const runLog = async (browser, log, name) => {
  const [width, height] = [log.viewport.width, log.viewport.height]
  const page = await browser.newPage()
  await page.setViewport({ width, height })
  await page.goto(log.url)

  // TODO adjust overall time-lapse.
  if (typeof log.timeLapse === 'number') {

  }

  const { events } = log
  for (let i = 0; i < events.length; i++) {
    events[i].interval = i === 0
      ? events[i].ts : events[i].ts - events[i - 1].ts
  }

  for (let i = 0; i < events.length; i++) {
    const event = events[i]
    const { type, x, y, interval, code } = event
    await wait(interval)

    // Ignore click and keypress events.
    if (type === 'mousemove') {
      await page.mouse.move(x, y)
    } else if (type === 'mousedown') {
      // FIXME may lead to redundant move events.
      await page.mouse.move(x, y)
      await page.mouse.down()
    } else if (type === 'mouseup') {
      await page.mouse.up()
    } else if (type === 'dblclick') {
      await page.mouse.click(x, y, { clickCount: 2 })
    } else if (type === 'keydown') {
      await page.keyboard.down(code)
    } else if (type === 'keyup') {
      await page.keyboard.up(code)
    }
  }

  ensureRepeaterDir()
  const screenshotPath = join(process.cwd(), `./.repeater/${name}.png`)
  await page.screenshot({ path: screenshotPath })
  console.log('screeenshot done')
}

const createChromePool = async () => {
  const factory = {
    create () {
      return puppeteer.launch({
        executablePath: os.platform() === 'darwin'
          ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
          : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        args: [
          `--window-size=${global.chromeWidth},${global.chromeHeight}`
        ],
        headless: false
      })
    },
    destroy (browser) { browser.close() }
  }
  const opts = { max: 3, acquireTimeoutMillis: 60e3, priorityRange: 3 }
  global.chromePool = genericPool.createPool(factory, opts)

  global.chromePool.on('factoryCreateError', console.error)
  global.chromePool.on('factoryDestroyError', console.error)
}

const destroyChromePool = async () => {
  global.chromePool.drain().then(() => {
    global.chromePool.clear()
  })
}

const batchRun = async (filePaths) => {
  const logs = filePaths.map(getJSONByPath)
  await createChromePool()
  const promises = logs.map((log, i) => new Promise((resolve, reject) => {
    global.chromeWidth = log.viewport.width
    global.chromeHeight = log.viewport.height
    global.chromePool.acquire().then(async (browser) => {
      await runLog(browser, log, getLogNameByPath(filePaths[i]))
      await global.chromePool.destroy(browser)
    })
  }))
  await Promise.all(promises)
  await destroyChromePool()
}

module.exports = {
  batchRun
}
