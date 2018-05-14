import $ from 'jquery'
import Vue from 'vue/dist/vue.js'

void new Vue({
  el: '#app',
  template: document.getElementById('template').innerHTML,
  data () {
    return {
      message: 'Hello Vue!'
    }
  },
  computed: {
    demoTransform () {
      return 'scale(1.05 1.05)'
    }
  },
  mounted () {
    const svg = $('#demo')
    window.svg = svg
  },
  methods: {
    addE () {
      console.log('addE TODO')
    },
    subE () {
      console.log('subE TODO')
    }
  }
})
