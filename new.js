#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const name = process.argv[2]
const dir = path.resolve('./', name)

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${name}</title>
</head>
<body>
  <button id="btn">test</button>
  <script src="main.js"></script>
</body>
</html>
`

const packageStr = JSON.stringify({
  name,
  version: '0.0.0',
  main: 'main.js',
  repository: 'git@github.com:doodlewind/prototypes.git',
  author: 'Yifeng Wang <i@ewind.us>',
  private: true,
  license: 'UNLICENSED'
}, null, 2)

const mainStr = `document.getElementById('btn').onclick = () => {
  // TODO
}
`

fs.mkdirSync(dir)
fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8')
fs.writeFileSync(path.join(dir, 'main.js'), mainStr, 'utf8')
fs.writeFileSync(path.join(dir, 'package.json'), packageStr, 'utf8')
