const {
  readFile,
  initDir,
  wait,
  fetchImage,
  writeResult
} = require('./utils')

async function loopPages (names) {
  for (let i = 0; i < names.length; i++) {
    console.log(`fetch ${names[i]}: ${i + 1}/${names.length}`)
    const image = await fetchImage(names[i])
    await wait(3000)
    writeResult(names[i], image)
  }
}

function run () {
  const names = JSON.parse(readFile('./images.json'))
  initDir()
  loopPages(names)
}

run()
