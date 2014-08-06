var rules = require('./rules');


/**
 * Check that comments conform to the rules.
 *
 * @arg {Comment[]} comments - Array of comments.
 * @arg {function(string, Position)} report - Callback to report errors.
 */
var check = function (comments, report) {
  comments.forEach(function (comment) {
    rules.forEach(function (rule) {
      rule.check(comment, report.bind(null, rule.message));
    });
  });
};


module.exports = check;
