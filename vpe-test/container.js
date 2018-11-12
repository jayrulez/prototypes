export default {
  template: (`
    <div class="container">
      <editor ref="editor" />
    </div>
  `),
  computed: {
    editor () {
      return this.$refs.editor
    }
  },
  mounted () {
    this.editor.setTemplet({})
  }
}
