var esprima = require('esprima');


/**
 * Position in the source file.
 *
 * @see SpiderMonkey Parser API
 *   {@link https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API}
 *
 * @typedef {Object} Position
 * @property {number} line - Line number, 1-indexed.
 * @property {?number} column - Column number, 0-indexed.
 */


/**
 * Comments as returned from Esprima parser, locations being present.
 *
 * @typedef {Object} Comment
 * @property {string} type - Possible values: "Line", "Block".
 * @property {string} value - Comment body.
 * @property {{start: Position, end: Position}} loc - Location info.
 */

/**
 * Extract comments from code.
 *
 * @arg {string} code - JavaScript code.
 * @return {Comment[]} - Both line and column info is set.
 */
var extractComments = function (code) {
  return esprima.parse(code, {
    comment: true,
    loc: true
  }).comments;
};


module.exports = extractComments;
