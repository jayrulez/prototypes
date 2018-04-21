/**
 * @fileoverview Pangu whitespace for Chinese comments.
 * @author doodlewind
 */
'use strict'
var path = require('path')

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

var requireIndex = require('requireindex')

// ------------------------------------------------------------------------------
// Plugin Definition
// ------------------------------------------------------------------------------

// import all rules in lib/rules
module.exports.rules = requireIndex(path.resolve('./rules'))
