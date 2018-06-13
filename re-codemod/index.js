const glob = require('glob')
const fs = require('fs-extra')

const filePath = process.argv[2]

glob(filePath, (err, files) => {
  if (err) throw err

  files.forEach(file => {
    fs.readFile(file, 'utf8').then(code => {
      const re = /lodash\.(.)+\(/g
      const matchResults = code.match(re)

      const methodNames = matchResults.map(
        result => result.replace('lodash.', '').replace('(', '')
      )
      let modCode = code
        .replace(
          `import lodash from 'lodash'`,
          `import { ${methodNames.join(', ')} } from 'lodash'`
        )
      matchResults.forEach((result, i) => {
        // eslint-disable-next-line
        const re = result.replace('.', '\\.').replace('(', '\\(')
        modCode = modCode.replace(new RegExp(re, 'g'), methodNames[i] + '(')
      })
      console.log(modCode)
    })
  })
})
