const puppeteer = require('puppeteer-core')
const genericPool = require('generic-pool')

const createChromePool = async (userOptions) => {
  const { executablePath, headless, poolTimeout, concurrency } = userOptions
  const factory = {
    create () {
      return puppeteer.launch({
        executablePath,
        args: [`--window-size=${global.chromeWidth},${global.chromeHeight}`],
        headless
      })
    },
    destroy (browser) { browser.close() }
  }
  const timeout = poolTimeout * 10e3
  const poolOptions = {
    max: concurrency, acquireTimeoutMillis: timeout, priorityRange: 3
  }

  global.chromePool = genericPool.createPool(factory, poolOptions)
  global.chromePool.on('factoryCreateError', console.error)
  global.chromePool.on('factoryDestroyError', console.error)
}

const destroyChromePool = async () => {
  global.chromePool.drain().then(() => {
    global.chromePool.clear()
  })
}

const run = async (options) => {
  await createChromePool(options)
  global.chromeWidth = 300
  global.chromeHeight = 300
  await global.chromePool.acquire().then(async (browser) => {
    const page = await browser.newPage()
    await page.goto('http://localhost:1234')
    const testObj = await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        window.addEventListener('test-ready', () => {
          // FIXME non-serializable
          // resolve(window.__TEST_OBJECT__)
        })
      })
    })
    // Log in browser console.
    console.log(testObj)
    await global.chromePool.destroy(browser)
  })
  await destroyChromePool()
}

module.exports = {
  run
}
