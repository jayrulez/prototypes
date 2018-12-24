const puppeteer = require('puppeteer-core')
const os = require('os')
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

  const { events } = log
  for (let i = 0; i < events.length; i++) {
    events[i].interval = i === 0
      ? events[i].ts : events[i].ts - events[i - 1].ts
  }

  for (let i = 0; i < events.length; i++) {
    const event = events[i]
    const { type, x, y, interval, code } = event
    await wait(interval)

    // TODO figure out processing for keypress
    if (type === 'mousemove') {
      await page.mouse.move(x, y)
    } else if (type === 'mousedown') {
      // HACK may lead to redundant move events
      await page.mouse.move(x, y)
      await page.mouse.down()
    } else if (type === 'mouseup') {
      await page.mouse.up()
    } else if (type === 'keydown') {
      await page.keyboard.down(code)
    } else if (type === 'keyup') {
      await page.keyboard.up(code)
    }
  }

  await page.screenshot({ path: 'snapshot.png' })
  await browser.close()
})()
