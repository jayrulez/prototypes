'use strict'

module.exports = function (context) {
  return {
    'VariableDeclaration': function (node) {
      node.declarations.forEach(function (variableDeclarator) {
        if (
          variableDeclarator.id.name === '_' &&
          variableDeclarator.init.type === 'CallExpression' &&
          variableDeclarator.init.callee.name === 'require'
        ) {
          context.report(
            node,
            'Prefer importing single functions over a full FP library'
          )
        }
      })
    }
  }
}

module.exports.schema = []
