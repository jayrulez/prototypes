#!/usr/bin/env node
const { join } = require('path')
const program = require('commander')
const {
  getActionByLocation,
  getDefaultChromiumPath,
  getJSONByPath,
  getLogNameByLocation
} = require('./utils')
const { batchRun, runLog } = require('./puppeteer-runner')
const pkg = require('../package.json')

const defaultPath = getDefaultChromiumPath()

program
  .version(pkg.version)
  .usage('<location> [options]')
  .option('--update', '', false)
  .option('--concurrency [concurrency]', 'Test runner concurrency', 4)
  .option('--chromium-path [path]', 'Chromium revision path', defaultPath)
  .parse(process.argv)

;(async () => {
  // program.concurrency
  // program.chromiumPath
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
      const filePath = join(process.cwd(), location)
      const log = getJSONByPath(filePath)
      runLog(log, getLogNameByLocation(filePath))
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
      await batchRun(action.files, location)
      break
    }
  }
})()
