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
    this.editor.$on('load', () => {
      console.log('TODO record events')
    })
    this.editor.setTemplet({})
  }
}
