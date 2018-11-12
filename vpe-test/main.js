import Vue from 'vue/dist/vue.js'
import VuePosterEditor from 'vue-poster-editor'
import Container from './container'
import './vue-poster-editor.css'

Vue.use(VuePosterEditor)

const template = (`
  <div id="app">
    <Container />
  </div>
`)

void new Vue({
  el: '#app',
  template,
  components: {
    Container
  },
  methods: {}
})
