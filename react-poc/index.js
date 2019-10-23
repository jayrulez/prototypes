// import './polyfill.js'
import React from 'react/cjs/react.development.js'
import MyRenderer from './renderer.js'

const Text = 'TEXT'
const Rect = 'RECT'

const App = (
  <Rect>
    <Text key={0}>123</Text>
    <Text key={1}>123</Text>
    <Text key={2}>123</Text>
    <Rect>
      <Rect />
    </Rect>
  </Rect>
)

MyRenderer.render(App)
