#!/usr/bin/env node
const { join } = require('path')
const program = require('commander')
const {
  getActionByLocation,
  getDefaultChromiumPath
} = require('./utils')
const { batchRun } = require('./puppeteer-runner')
const pkg = require('../package.json')

const defaultPath = getDefaultChromiumPath()

program
  .version(pkg.version)
  .usage('<location> [options]')
  .option('--update', 'Update existing screenshots', false)
  .option('--concurrency [concurrency]', 'Test runner concurrency', 4)
  .option('--headless', 'Hide browser window')
  .option('--timeout', 'Browser pool wait timeout', 60e3)
  .option('--executable-path [path]', 'Chrome path', defaultPath)
  .parse(process.argv)

;(async () => {
  const options = {
    concurrency: parseInt(program.concurrency),
    executablePath: program.executablePath,
    timeout: parseInt(program.timeout),
    headless: Boolean(program.headless)
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
      batchRun([join(process.cwd(), location)], options)
      break
    }
    case 'single-update': {
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
      // TODO
      break
    }
    case 'batch-update': {
      const filePaths = action.files
        .map(name => join(process.cwd(), location, name))
      await batchRun(filePaths, options)
      break
    }
  }
})()
