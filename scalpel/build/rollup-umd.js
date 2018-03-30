import config from './rollup'

config.output = {
  file: './lib/scalpel.js',
  format: 'umd',
  name: 'Scalpel',
  sourcemap: true
}

export default config
