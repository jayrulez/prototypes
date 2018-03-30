import config from './rollup'

config.output = {
  file: './lib/index.js',
  format: 'cjs',
  name: 'Scalpel',
  sourcemap: true
}

export default config
