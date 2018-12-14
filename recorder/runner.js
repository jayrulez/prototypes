const puppeteer = require('puppeteer-core')
const os = require('os')
const { mergeEvents } = require('./utils')
const log = require('./log.json')

const wait = (delay) => new Promise((resolve, reject) => {
  setTimeout(() => resolve(), delay)
})

;(async () => {
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

  const events = mergeEvents(log.events)

  for (let i = 0; i < events.length; i++) {
    const event = events[i]
    const { type, x, y, interval } = event
    await wait(interval)

    if (type === 'mousemove') {
      await page.mouse.move(x, y)
    } else if (type === 'mousedown') {
      await page.mouse.down()
    } else if (type === 'mouseup') {
      await page.mouse.up()
    }
  }

  await page.screenshot({ path: 'test.png' })
  await browser.close()
})()
