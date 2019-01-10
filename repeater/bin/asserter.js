const fs = require('fs')
const { join } = require('path')
const { PNG } = require('pngjs')
const pixelmatch = require('pixelmatch')

const readPNG = (caseName) => new Promise((resolve, reject) => {
  const expectedName = join(__dirname, `./cases/${caseName}.png`)
  const expectedImg = fs.createReadStream(expectedName).pipe(new PNG()).on('parsed', doneReading)

  const actualName = join(__dirname, `./cases/${caseName}-screenshot-tmp.png`)
  const actualImg = fs.createReadStream(actualName).pipe(new PNG()).on('parsed', doneReading)

  let filesRead = 0

  function doneReading () {
    if (++filesRead < 2) return
    const diff = new PNG({ width: expectedImg.width, height: expectedImg.height })

    const mismatchedPixels = pixelmatch(
      expectedImg.data,
      actualImg.data,
      diff.data,
      expectedImg.width,
      expectedImg.height,
      { threshold: 0.1 }
    )
    const ratio = mismatchedPixels / (expectedImg.width * expectedImg.height)

    const passed = ratio < 0.5 / 100 // 0.5% pixels as threshold

    if (!passed) {
      const diffName = join(__dirname, `./cases/${caseName}-fail-diff.png`)
      diff.pack().pipe(fs.createWriteStream(diffName))
        .on('finish', () => resolve({ result: false, ratio }))
        .on('error', reject)
    } else {
      resolve({ result: true, ratio })
    }
  }
})

module.exports = {
  readPNG
}

// // const cases = ['drag-mask', 'resize-mask']; // ...
// const cases = fs
//   .readdirSync(join(__dirname, './cases'))
//   .filter(name => name.includes('.json'))
//   .map(name => name.replace('.json', ''))

// for (let i = 0; i < cases.length; i++) {
//   const caseName = cases[i]
//   test(caseName, async t => {
//     const { result, ratio } = await readPNG(caseName)
//     t.true(result, `Diff mismatched with ${(ratio * 100).toFixed(2)}% different pixels!\nSee ${caseName}-fail-diff.png for details.`)
//   })
// }
