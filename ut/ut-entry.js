#!/usr/bin/env node
const { getDefaultChromiumPath } = require('./utils')
const { run } = require('./pool')

;(async () => {
  const options = {
    executablePath: getDefaultChromiumPath(),
    headless: false,
    poolTimeout: 60,
    concurrency: 4
  }
  await run(options)
})()
