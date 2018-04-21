'use strict'

var rule = require('../lib/rules')
var RuleTester = require('eslint').RuleTester

var ruleTester = new RuleTester()
ruleTester.run('no-full-fp-lib', rule, {
  valid: [
    "var $ = require('jquery');",
    "var filter = require('lodash/fp/filter')"
  ],
  invalid: [
    {
      code: "var _ = require('your favorite fp library');",
      errors: [{
        message: 'Prefer importing single functions over a full FP library',
        type: 'VariableDeclaration'
      }]
    }
  ]
})
