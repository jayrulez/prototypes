/**
 * @fileoverview Pangu whitespace for Chinese comments.
 * @author doodlewind
 */

const path = require('path')

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const requireIndex = require('requireindex')

// ------------------------------------------------------------------------------
// Plugin Definition
// ------------------------------------------------------------------------------

// import all rules in lib/rules
module.exports.rules = requireIndex(path.resolve('./rules'))
