import fs from 'fs'
import path from 'path'
import glob from 'glob'

export function validateDirs (dirs) {
  if (!dirs) return false
  const dir = dirs[0]
  // debugger // eslint-disable-line
  console.log(fs.lstatSync(dir).isDirectory())
  if (!fs.lstatSync(dir).isDirectory()) return false

  return true
}

export function getImages (dirs) {
  return new Promise((resolve, reject) => {
    const imagePath = path.join(dirs[0], '**/*.jpg')
    glob(imagePath, (err, files) => {
      console.log(imagePath, files)
      if (err) reject(err)
      resolve(files)
    })
  })
}
