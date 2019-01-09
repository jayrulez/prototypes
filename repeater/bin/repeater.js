#!/usr/bin/env node
const fs = require('fs')
const { join } = require('path')
const program = require('commander')
const { getDefaultChromiumPath } = require('./utils')
const { run } = require('./puppeteer-runner')
const pkg = require('../package.json')

const defaultPath = getDefaultChromiumPath()

program
  .version(pkg.version)
  .usage('<name> [options]')
  .option('--concurrency [concurrency]', 'Test runner concurrency', 4)
  .option('--chromium-path [path]', 'Chromium revision path', defaultPath)
  .parse(process.argv)

// program.concurrency
// program.chromiumPath
const name = program.args[0]
if (name.includes('.json')) {
  // TODO error handling
  const fileName = join(process.cwd(), name)
  const log = JSON.parse(fs.readFileSync(fileName, 'utf8'))
  run(log)
} else {
  console.log('Batch runner WIP')
}
