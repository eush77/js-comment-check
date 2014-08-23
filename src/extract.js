'use strict';

var esprima = require('esprima');


/**
 * Position in the source file.
 *
 * @see [SpiderMonkey Parser API]
 *   {@link https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API}
 *
 * @typedef {Object} Position
 * @property {number} line - Line number, 1-indexed.
 * @property {?number} column - Column number, 0-indexed.
 */


/**
 * Location - position range.
 *
 * @typedef {Object} Location
 * @property {Position} start - Column number must be set.
 * @property {Position} end - Column number must be set.
 */


/**
 * Extract comments from code.
 * Each comment is represented by a string within its usual comment delimiters.
 *
 * @arg {string} code - JavaScript code.
 * @return {{text: string, loc: Location}[]}
 */
var extract = function (code) {
  return esprima.parse(code, {
    comment: true,
    loc: true
  }).comments.map(function (comment) {
    return {
      text: (comment.type == 'Line')
        ? '//' + comment.value
        : '/*' + comment.value + '*/',
      loc: comment.loc
    };
  });
};


module.exports = extract;
