const glob = require('glob')
const fs = require('fs-extra')

const filePath = process.argv[2]

// Usage
// node index.js ../foo/\*.js
glob(filePath, (err, files) => {
  if (err) throw err

  files.forEach(file => {
    fs.readFile(file, 'utf8').then(code => {
      const re = /lodash\.(.)+?\(/g
      const matchResults = code.match(re)

      if (!matchResults) return
      console.log('mod', file)

      const methodNames = matchResults.map(
        result => result.replace('lodash.', '').replace('(', '')
      )
      const filteredNames = Array.from(new Set(methodNames))
      let modCode = code.replace(
        `import lodash from 'lodash'`,
        `import { ${filteredNames.join(', ')} } from 'lodash'`
      )
      matchResults.forEach((result, i) => {
        // eslint-disable-next-line
        const re = result.replace('.', '\\.').replace('(', '\\(')
        modCode = modCode.replace(new RegExp(re, 'g'), methodNames[i] + '(')
      })
      fs.writeFile(file, modCode, 'utf8')
    })
  })
})
