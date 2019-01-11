#!/usr/bin/env node
const { join } = require('path')
const program = require('commander')
const {
  getActionByLocation,
  getDefaultChromiumPath
} = require('./utils')
const { batchRun } = require('./puppeteer-runner')
const { batchTest } = require('./asserter')
const pkg = require('../package.json')

const defaultPath = getDefaultChromiumPath()

program
  .version(pkg.version)
  .usage('<location> [options]')
  .option('--update', 'Update existing screenshots', false)
  .option('--concurrency [concurrency]', 'Test runner concurrency', 4)
  .option('--pool-timeout [timeout]', 'Browser pool timeout in seconds', 60)
  .option('--headless', 'Hide browser window')
  .option('--executable-path [path]', 'Chrome path', defaultPath)
  .option('--diff-threshold [percentage]', 'For image diff, 0 to 100', 0.5)
  .parse(process.argv)

;(async () => {
  const options = {
    concurrency: parseInt(program.concurrency),
    executablePath: program.executablePath,
    poolTimeout: parseInt(program.poolTimeout),
    headless: Boolean(program.headless),
    diffThreshold: parseFloat(program.diffThreshold)
  }

  const location = program.args[0] || ''
  const action = await getActionByLocation(location, program.update)
  console.log('Repeater action:', action.type)

  switch (action.type) {
    case 'single-not-found': {
      console.log('Invalid test location!')
      process.exitCode = 1
      break
    }
    case 'single-test': {
      const filePaths = [join(process.cwd(), location)]
      await batchRun(filePaths, options)
      await batchTest(filePaths, options)
      break
    }
    case 'single-update': {
      const filePaths = [join(process.cwd(), location)]
      await batchRun(filePaths, options)
      // TODO
      break
    }
    case 'batch-not-found': {
      console.log('Invalid test location!')
      process.exitCode = 1
      break
    }
    case 'batch-error': {
      console.log('Error opening test files!')
      process.exitCode = 1
      break
    }
    case 'batch-invalid': {
      console.log('Some logs do not has their screenshot. Aborting.')
      process.exitCode = 1
      break
    }
    case 'batch-test': {
      const filePaths = action.files
        .map(name => join(process.cwd(), location, name))
      await batchRun(filePaths, options)
      await batchTest(filePaths, options)
      break
    }
    case 'batch-update': {
      const filePaths = action.files
        .map(name => join(process.cwd(), location, name))
      await batchRun(filePaths, options)
      // TODO
      break
    }
  }
})()
