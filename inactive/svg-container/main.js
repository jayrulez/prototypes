import Vue from 'vue/dist/vue.js'

void new Vue({
  el: '#app',
  template: document.getElementById('template').innerHTML,
  data () {
    return {
      width: 575,
      height: 250,
      scale: 1,
      boxes: {
        nw: null,
        n: null,
        ne: null,
        w: null,
        c: null,
        e: null,
        sw: null,
        s: null,
        se: null
      },
      transform: {
        scale: 1,
        nw: { sx: 1, sy: 1, tx: 0, ty: 0 },
        n: { sx: 1, sy: 1, tx: 0, ty: 0 },
        ne: { sx: 1, sy: 1, tx: 0, ty: 0 },
        w: { sx: 1, sy: 1, tx: 0, ty: 0 },
        c: { sx: 1, sy: 1, tx: 0, ty: 0 },
        e: { sx: 1, sy: 1, tx: 0, ty: 0 },
        sw: { sx: 1, sy: 1, tx: 0, ty: 0 },
        s: { sx: 1, sy: 1, tx: 0, ty: 0 },
        se: { sx: 1, sy: 1, tx: 0, ty: 0 }
      }
    }
  },
  computed: {
    viewBox () {
      return `0 0 ${this.width} ${this.height}`
    },
    tScale () {
      return `scale(${this.transform.scale})`
    },
    tNW () {
      return this.getComputedTransform('nw')
    },
    tN () {
      return this.getComputedTransform('n')
    },
    tNE () {
      return this.getComputedTransform('ne')
    },
    tW () {
      return this.getComputedTransform('w')
    },
    tC () {
      return this.getComputedTransform('c')
    },
    tE () {
      return this.getComputedTransform('e')
    },
    tS () {
      return this.getComputedTransform('s')
    },
    tSE () {
      return this.getComputedTransform('se')
    },
    tSW () {
      return this.getComputedTransform('sw')
    }
  },
  mounted () {
    const svg = document.getElementById('demo')
    this.svg = svg
    this.initBoxes()
  },
  methods: {
    getMiddlePoint (box) {
      return [box.x + box.width / 2, box.y + box.height / 2]
    },
    getBBox (el) {
      return this.svg.getElementById(el).getBBox()
    },
    getComputedTransform (dir) {
      const { sx, sy, tx, ty } = this.transform[dir]
      if (!this.svg) return null

      const box = this.boxes[dir]
      const [mx, my] = this.getMiddlePoint(box)
      return `translate(${tx} ${ty}) translate(${mx} ${my}) scale(${sx} ${sy}) translate(${-mx} ${-my})`
    },
    initBoxes () {
      const { getBBox } = this
      this.boxes = {
        se: getBBox('se'),
        s: getBBox('s'),
        sw: getBBox('sw'),
        e: getBBox('e'),
        c: getBBox('c'),
        w: getBBox('w'),
        ne: getBBox('ne'),
        n: getBBox('n'),
        nw: getBBox('nw')
      }
    },
    // FIXME 计入 scale 参数
    setW (offset) {
      const { transform } = this
      const middleGroup = ['n', 'c', 's']
      middleGroup.forEach(dir => {
        const box = this.getBBox(dir)
        transform[dir].sx = (box.width + offset) / this.boxes[dir].width
        transform[dir].tx += offset / 2
      })
      const rightGroup = ['ne', 'e', 'se']
      rightGroup.forEach(dir => {
        transform[dir].tx += offset
      })
      this.width += offset
    },
    // FIXME 计入 scale 参数
    setH (offset) {
      const { transform } = this
      const middleGroup = ['w', 'c', 'e']
      middleGroup.forEach(dir => {
        const box = this.getBBox(dir)
        transform[dir].sy = (box.height + offset) / this.boxes[dir].height
        transform[dir].ty += offset / 2
      })
      const bottomGroup = ['sw', 's', 'se']
      bottomGroup.forEach(dir => {
        transform[dir].ty += offset
      })
      this.height += offset
    },
    setScale (scale) {
      this.width *= scale
      this.height *= scale
      this.transform.scale *= scale
    }
  }
})
