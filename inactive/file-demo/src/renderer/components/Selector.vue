<template>
  <div id="wrapper">
    <button @click="openDir">选择目录</button>
    <div class="file-item"
      v-for="file in files"
      @click="openFile(file)"
    >
      {{ file }}
    </div>
    <div>{{ msg }}</div>
  </div>
</template>

<script>
import { remote } from 'electron'
import { getImages, validateDirs } from './utils'

export default {
  name: 'selector',
  components: {},
  data () {
    return {
      msg: '',
      files: []
    }
  },
  methods: {
    onSelected (dirs) {
      if (!validateDirs(dirs)) {
        this.msg = '打开失败'
        this.files = []
        return
      }
      getImages(dirs).then(files => {
        this.msg = ''
        this.files = files
      })
    },
    openFile (file) {
      remote.shell.openItem(file)
    },
    openDir () {
      remote.dialog.showOpenDialog({
        properties: ['openDirectory']
      }, this.onSelected)
    }
  }
}
</script>

<style>
.file-item {
  cursor: pointer;
}
</style>
