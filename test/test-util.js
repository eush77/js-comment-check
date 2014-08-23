'use strict';

var extract = require('../src/extract')
  , parseFormat = require('../src/parse-format')
  , advance = require('../src/util').advance;

var stackTrace = require('stack-trace')
  , _ = {
    compose: require('lodash.compose')
  };

var fs = require('fs');


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
  ruleChecker(comment, _.compose([].push.bind(positions), advance));
  return positions;
};


/**
 * Extract comments from file and leave only those that start with "/*!" or "//!".
 * The bang mark itself is contracted from the output.
 *
 * Valid options:
 *   - parseFormat: boolean, defaults to true.
 *
 * @arg {string} filename
 * @arg {Object} [options]
 * @return {Comment[] | {text: string, loc: Location}[]} Depending on parseFormat option.
 */
exports.extractMarkedComments = function (filename, options) {
  options = options || {};
  if (options.parseFormat == null) {
    options.parseFormat = true;
  }

  var comments = extract(fs.readFileSync(filename).toString()).filter(function (comment) {
    return comment.text[2] == '!';
  }).map(function (comment) {
    comment.text = comment.text.slice(0, 2) + comment.text.slice(3);
    return comment;
  });

  return options.parseFormat ? parseFormat(comments) : comments;
};
