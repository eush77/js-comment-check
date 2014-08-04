var esprima = require('esprima');


/**
 * Extract comments from code.
 *
 * @arg {string} code - JavaScript code.
 * @return {Array} Array of comments, in Mozilla Parser API format, locations being present.
 */
module.exports = function (code) {
  return esprima.parse(code, {
    comment: true,
    loc: true
  }).comments;
};
