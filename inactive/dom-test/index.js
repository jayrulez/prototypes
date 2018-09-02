const puppeteer = require('puppeteer')

puppeteer.launch({
  headless: false,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
}).then(async browser => {
  const page = await browser.newPage()
  await page.goto('http://localhost:8080')
  await browser.close()
})
