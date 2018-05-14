import $ from 'jquery'
import Vue from 'vue/dist/vue.js'

void new Vue({
  el: '#app',
  template: document.getElementById('template').innerHTML,
  data () {
    return {
      baseWidth: 575,
      baseHeight: 250,
      stretchX: 1,
      stretchY: 1,
      scale: 1
    }
  },
  computed: {
    tSE () {
      const offsetX = this.baseWidth * (this.stretchX - 1)
      const offsetY = this.baseHeight * (this.stretchY - 1)
      return `translate(${offsetX} ${offsetY})`
    }
  },
  mounted () {
    const svg = $('#demo')
    window.svg = svg
  },
  methods: {
    addW () {
      this.stretchX *= 1.001
    },
    subW () {
      this.stretchX *= 0.999
    }
  }
})
