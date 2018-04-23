const pangu = require('pangu')

module.exports = {
  meta: {
    schema: []
  },
  create (context) {
    const sourceCode = context.getSourceCode()

    return {
      Program () {
        const comments = sourceCode.getAllComments()
        comments
          .filter(token => token.type !== 'Shebang')
          .forEach(node => {
            if (pangu.spacing(node.value) !== node.value) {
              context.report(
                node,
                'Inappropriate Chinese spacing.'
              )
            }
          })
      }
    }
  }
}
