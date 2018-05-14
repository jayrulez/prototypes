import $ from 'jquery'
import Vue from 'vue/dist/vue.js'

void new Vue({
  el: '#app',
  template: document.getElementById('template').innerHTML,
  data () {
    return {
      baseWidth: 575,
      baseHeight: 250,
      currWidth: 575,
      currHeight: 250,
      scale: 1
    }
  },
  computed: {
    tSE () {
      return null
    }
  },
  mounted () {
    const svg = $('#demo')
    window.svg = svg
  },
  methods: {
    addW () {
      this.currWidth += 10
    },
    subW () {
      this.currWidth -= 10
    }
  }
})
