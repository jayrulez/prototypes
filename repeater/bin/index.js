#!/usr/bin/env node

const { run } = require('./puppeteer-runner')

const log = require('../examples/click/test/give-me-five.json')

run(log, 'give-me-five')
