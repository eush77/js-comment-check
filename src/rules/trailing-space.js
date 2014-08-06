/**
 * @type {RuleChecker}
 */
module.exports = function (comment, report) {
  comment.lines.forEach(function (line, index) {
    if (/\s$/.test(line)) {
      report({
        line: comment.position.line + index
      });
    }
  });
};
