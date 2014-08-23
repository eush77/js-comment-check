'use strict';

var advance = require('../util').advance;


/**
 * Forbid whitespace characters other than plain spaces.
 *
 * @type {RuleChecker}
 */
exports.unconventionalWhitespace = function (comment, report) {
  comment.lines.forEach(function (line, lineIndex) {
    line.replace(/\s/g, function (match, columnIndex) {
      if (match != ' ') {
        report(advance(comment.position, {
          line: lineIndex,
          column: columnIndex
        }));
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

    line.trim().replace(/\s{2,}/g, function (match, columnIndex) {
      report(advance(comment.position, {
        line: lineIndex,
        column: indent + columnIndex
      }));
    });
  });
};


/**
 * Check indentation inside multiline comments.
 * The only rule to be checked is this:
 *   1. If previous line is empty or nonexistent, indentation is forbidden.
 *
 * @type {RuleChecker}
 */
exports.indentation = function (comment, report) {
  comment.lines.reduce(function (firstLine, line, lineIndex) {
    if (firstLine && line[0] == ' ') {
      report({
        line: comment.position.line + lineIndex
      });
    }

    // Pass the flag to the next iteration.
    return !line.length;
  }, true);
};
