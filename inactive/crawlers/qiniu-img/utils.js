const { readFileSync, writeFileSync } = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const rp = require('request-promise-native')

function readFile (name) {
  return readFileSync(path.resolve(name), 'utf8')
}

const headers = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36'
}

async function fetchImage (name) {
  const url = 'http://7u2gqx.com1.z0.glb.clouddn.com/' + encodeURIComponent(name)
  console.log(url)
  const options = { url, headers, encoding: 'binary' }

  try {
    const body = await rp(options)
    return body
  } catch (err) { console.error(err) }
}

const wait = time => new Promise((resolve, reject) => {
  setTimeout(resolve, time + Math.random() * time)
})

function initDir () {
  mkdirp.sync(path.join(path.resolve('./results')))
}

function writeResult (name, image) {
  writeFileSync(
    path.join(path.resolve('./results'), name.replace(/\//g, '-')),
    image,
    'binary'
  )
}

module.exports = {
  fetchImage,
  initDir,
  readFile,
  wait,
  writeResult
}
