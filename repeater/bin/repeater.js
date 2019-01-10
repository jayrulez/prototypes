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

// program.concurrency
// program.chromiumPath
const name = program.args[0]
const action = getActionByName(name, program.update)
switch (action) {
  case 'not-found': {
    console.log('Invalid test name!')
    process.exitCode = 1
    break
  }
  case 'test-single': {
    const filePath = join(process.cwd(), name)
    const log = getJSONByPath(filePath)
    run(log, getLogNameByPath(filePath))
    break
  }
}
