const puppeteer = require('puppeteer-core')

;(async () => {
  const [width, height] = [500, 400]
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    args: [
      `--window-size=${width},${height}`
    ],
    headless: false
  })
  const page = await browser.newPage()
  await page.setViewport({ width, height })
  await page.goto('https://baidu.com')

  const dimensions = await page.evaluate(() => {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      deviceScaleFactor: window.devicePixelRatio
    }
  })

  await page.screenshot({ path: 'baidu.png' })

  console.log('Dimensions:', dimensions)

  await browser.close()
})()
