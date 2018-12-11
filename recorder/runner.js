const puppeteer = require('puppeteer-core')
const os = require('os')

;(async () => {
  const [width, height] = [500, 400]
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
  await page.goto('http://localhost:1234')

  await page.screenshot({ path: 'test.png' })

  await browser.close()
})()
