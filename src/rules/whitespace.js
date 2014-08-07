/**
 * Forbid whitespace characters other than plain spaces.
 *
 * @type {RuleChecker}
 */
exports.unconventionalWhitespace = function (comment, report) {
  comment.lines.forEach(function (line, lineIndex) {
    line.replace(/\s/g, function (match, index) {
      if (match != ' ') {
        report({
          line: comment.position.line + lineIndex,
          column: comment.position.column + index
        });
      }
    });
  });
};


/**
 * Forbid more than a single space between words.
 *
 * @type {RuleChecker}
 */
exports.spacesInARow = function (comment, report) {
  comment.lines.forEach(function (line, lineIndex) {
    var indent = line.match(/^\s*/)[0].length;

    line.trim().replace(/\s{2,}/g, function (match, index) {
      report({
        line: comment.position.line + lineIndex,
        column: comment.position.column + indent + index
      });
    });
  });
};


/**
 * Check indentation inside multiline comments.
 *   1. If adjacent lines are indented, indentation sizes must be equal.
 *   2. If previous line is empty or nonexistent, indentation is forbidden.
 *
 * @type {RuleChecker}
 */
exports.indentation = function (comment, report) {
  var previousIndent, previousLength;

  comment.lines.forEach(function (line, lineIndex) {
    var indent = line.match(/^\s*/)[0].length;
    if (previousIndent && indent && indent != previousIndent ||
        !previousLength && indent) {
      report({
        line: comment.position.line + lineIndex
      });
    }

    previousIndent = indent;
    previousLength = line.length;
  });
};
