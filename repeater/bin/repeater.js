#!/usr/bin/env node
const { join } = require('path')
const program = require('commander')
const {
  getActionByName,
  getDefaultChromiumPath,
  getJSONByPath,
  getLogNameByPath
} = require('./utils')
const { run } = require('./puppeteer-runner')
const pkg = require('../package.json')

const defaultPath = getDefaultChromiumPath()

program
  .version(pkg.version)
  .usage('<name> [options]')
  .option('--update', '', false)
  .option('--concurrency [concurrency]', 'Test runner concurrency', 4)
  .option('--chromium-path [path]', 'Chromium revision path', defaultPath)
  .parse(process.argv)

;(async () => {
  // program.concurrency
  // program.chromiumPath
  const name = program.args[0] || ''
  const action = await getActionByName(name, program.update)
  console.log('Repeater action:', action.type)

  switch (action.type) {
    case 'single-not-found': {
      console.log('Invalid test name!')
      process.exitCode = 1
      break
    }
    case 'single-test': {
      const filePath = join(process.cwd(), name)
      const log = getJSONByPath(filePath)
      run(log, getLogNameByPath(filePath))
      break
    }
    case 'single-update': {
      // TODO
      break
    }
    case 'batch-not-found': {
      console.log('Invalid test name!')
      process.exitCode = 1
      break
    }
    case 'batch-error': {
      console.log('Error opening test files')
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
      // TODO
      break
    }
  }
})()
