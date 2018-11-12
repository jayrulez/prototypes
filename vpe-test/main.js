import Vue from 'vue/dist/vue.js'
import VuePosterEditor from 'vue-poster-editor'
import Container from './container'
import './vue-poster-editor.css'

Vue.use(VuePosterEditor)

void new Vue({
  el: '#app',
  template: `<Container />`,
  components: { Container }
})
