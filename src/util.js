var extract = require('../src/extract'),
    parseFormat = require('../src/parse-format'),
    stackTrace = require('stack-trace');

var _ = {
  compose: require('lodash.compose')
};

var fs = require('fs');


/**
 * Advance position by increment.
 * That is, add increment.line to position.line and increment.column to position.column.
 * Return a fresh position.
 *
 * If a property does not exist in position, it is skipped.
 * If a property does not exist in increment, it is left unchanged.
 * Note that this behaviour makes the function sensitive to the order of arguments (noncommutative).
 *
 * If the second argument is omitted, effectively make a copy of the original position.
 *
 * @arg {Position} position
 * @arg {Position} [increment]
 * @return {Position}
 */
exports.advance = function (position, increment) {
  increment = increment || {};
  var result = Object.create(null);

  if (position.line != null) {
    result.line = position.line + (increment.line || 0);
  }
  if (position.column != null) {
    result.column = position.column + (increment.column || 0);
  }

  return result;
};


/**
 * Extract comments from file and leave only those that start with "/*!" or "//!".
 * The bang mark itself is contracted from the output.
 *
 * @arg {string} filename
 * @return {Comment[]}
 */
exports.extractMarkedComments = function (filename) {
  return parseFormat(extract(fs.readFileSync(filename).toString()).filter(function (comment) {
    return comment.text[2] == '!';
  }).map(function (comment) {
    comment.text = comment.text.slice(0, 2) + comment.text.slice(3);
    return comment;
  }));
};


/**
 * Run the given function and pass its first line's number.
 *
 * @arg {function(number)} proc
 * @return {*} Whatever proc returns.
 */
exports.withLineNumber = function (proc) {
  return proc(stackTrace.get()[1].getLineNumber() + 1);
};


/**
 * Decode escape sequences in a string.
 * If the given string contains a quotation mark ('"', U+0022), the exception is raised.
 * This assumption simplifies the implementation a lot.
 *
 * @arg {string} string
 * @return {string}
 */
exports.decodeString = function (string) {
  if (string.indexOf('"') >= 0) {
    throw new Error('Could not decode.');
  }

  return eval('"' + string + '"');
};


/**
 * Decode escape sequences in a comment's body.
 *
 * @arg {Comment} comment
 * @return {Comment} Same comment actually, mutated.
 */
exports.decodeComment = function (comment) {
  comment.lines = comment.lines.map(exports.decodeString);
  return comment;
};


/**
 * Fire the rule checker and capture all the positions it has thrown.
 *
 * @arg {RuleChecker} ruleChecker
 * @arg {Comment} comment - Comment to check with the rule.
 * @return {Position[]}
 */
exports.positions = function (ruleChecker, comment) {
  var positions = [];
  ruleChecker(comment, _.compose([].push.bind(positions), exports.advance));
  return positions;
};
