import fontList from './font-list.json'
import './setup'

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
