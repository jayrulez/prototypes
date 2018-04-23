const rule = require('../lib/rules/comment')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester()
ruleTester.run('comment', rule, {
  valid: [
    '// 123',
    `/** demo
 * foo
 * bar
 **/`
  ],
  invalid: [
    {
      code: '// 这是123不合适的注释',
      errors: [{
        message: 'Inappropriate Chinese spacing.',
        type: 'Line'
      }]
    }
  ]
})
