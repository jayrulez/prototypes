const puppeteer = require('puppeteer-core')
const os = require('os')
// Put recorded JSON here.
const log = require('./log.json')

const wait = (task, delay) => new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(task())
  }, delay)
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

  await Promise.all(log.events.click.map(e => {
    return wait(() => page.mouse.click(e.x, e.y), e.ts)
  }))

  await page.screenshot({ path: 'test.png' })
  await browser.close()
})()
