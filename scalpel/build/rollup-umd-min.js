
import babel from 'rollup-plugin-babel'
import cjs from 'rollup-plugin-commonjs'
import node from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'

import config from './rollup'

config.output = {
  file: './lib/scalpel.min.js',
  format: 'umd',
  name: 'Scalpel'
}

config.plugins = [
  babel({
    exclude: 'node_modules/**',
    sourceMap: true
  }),
  cjs({
    sourceMap: false
  }),
  node(),
  uglify({}, minify)
]

export default config
