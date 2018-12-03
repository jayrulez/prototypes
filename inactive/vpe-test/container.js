import fontList from './font-list.json'

export default {
  template: (`
    <div class="container">
      <editor ref="editor" :editorOptions="{fontList}" />
    </div>
  `),
  data () {
    return {
      fontList
    }
  },
  computed: {
    editor () {
      return this.$refs.editor
    }
  },
  mounted () {
    window.editor = this.editor
    this.editor.setTemplet({})
  }
}
