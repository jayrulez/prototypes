const puppeteer = require('puppeteer-core')
const os = require('os')
const { join } = require('path')
const { ensureRepeaterDir } = require('./utils')

const wait = (delay) => new Promise((resolve) => {
  setTimeout(() => resolve(), delay)
})

// Run log JSON and save screenshot to repeater's tmp dir.
const run = async (log, name) => {
  const [width, height] = [log.viewport.width, log.viewport.height]
  const browser = await puppeteer.launch({
    executablePath: os.platform() === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    args: [
      `--window-size=${width},${height}`
    ],
    headless: false
  })
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
  await browser.close()
}

module.exports = {
  run
}
