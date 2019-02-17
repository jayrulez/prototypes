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
  await global.chromePool.acquire().then(async (browser) => {
    // TODO
    console.log(browser)
    await global.chromePool.destroy(browser)
  })
  await destroyChromePool()
}

module.exports = {
  run
}
