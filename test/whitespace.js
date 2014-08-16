var extract = require('../src/extract'),
    parseFormat = require('../src/parse-format'),
    whitespace = require('../src/rules/whitespace'),
    advance = require('../src/util').advance;

var stackTrace = require('stack-trace'),
    _ = {
      compose: require('lodash.compose')
    };

var fs = require('fs');


/**
 * Some comments in this file are tests - those that start with "/*!" or "//!".
 * This variable lists them in the Array instance.
 * Individual comments are then shifted out along the way.
 * Since the purpose of the tests described here is to test whitespace-specific rules,
 *   these comments are parsed first according to the format.
 */
var comments = parseFormat(extract(fs.readFileSync(__filename).toString()).filter(function (comment) {
  return comment.text[2] == '!';
}).map(function (comment) {
  comment.text = comment.text.slice(0, 2) + comment.text.slice(3);
  return comment;
}));


/**
 * Run the given function and pass its first line's number.
 *
 * @arg {function(number)} proc
 * @return {*} Whatever proc returns.
 */
var withLineNumber = function (proc) {
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
var decode = function (string) {
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
var decodeComment = function (comment) {
  comment.lines = comment.lines.map(decode);
  return comment;
};


/**
 * Fire the rule checker and capture all the positions it has thrown.
 *
 * @arg {RuleChecker} ruleChecker
 * @arg {Comment} comment - Comment to check with the rule.
 * @return {Position[]}
 */
var positions = function (ruleChecker, comment) {
  var positions = [];
  ruleChecker(comment, _.compose([].push.bind(positions), advance));
  return positions;
};


describe('Whitespace', function () {
  it('should forbid whitespace characters other than plain spaces', function () {
    withLineNumber(function (line) {
      //! one tab\t, two tabs\t\t, three tabs and space in between\t\t \t - tabs
      positions(whitespace.unconventionalWhitespace, decodeComment(comments.shift()))
      .should.eql([{line: line, column: 16},
                   {line: line, column: 27},
                   {line: line, column: 28},
                   {line: line, column: 62},
                   {line: line, column: 63},
                   {line: line, column: 65}]);
    });

    withLineNumber(function (line) {
      //! vertical tab\x0b, form feed\f, carriage return\r - other unconventional ascii7
      positions(whitespace.unconventionalWhitespace, decodeComment(comments.shift()))
      .should.eql([{line: line, column: 21},
                   {line: line, column: 33},
                   {line: line, column: 51}]);
    });

    withLineNumber(function (line) {
      //! nbsp\xa0, ensp\u2002, emsp\u2003, ideographic space\u3000 - selected unicode space
      positions(whitespace.unconventionalWhitespace, decodeComment(comments.shift()))
      .should.eql([{line: line, column: 13},
                   {line: line, column: 20},
                   {line: line, column: 27},
                   {line: line, column: 47}]);
    });

    withLineNumber(function (line) {
      /*!*
       * \t\x0b\f\r\xa0\u2002\u2003\u3000
       */
      positions(whitespace.unconventionalWhitespace, decodeComment(comments.shift()))
      .should.eql([{line: line + 1, column: 9},
                   {line: line + 1, column: 10},
                   {line: line + 1, column: 11},
                   {line: line + 1, column: 12},
                   {line: line + 1, column: 13},
                   {line: line + 1, column: 14},
                   {line: line + 1, column: 15},
                   {line: line + 1, column: 16}]);
    });
  });

  it('should forbid more than a single space between words', function () {
    withLineNumber(function (line) {
      //! More  than   one    space, certainly!
      positions(whitespace.spacesInARow, comments.shift())
      .should.eql([{line: line, column: 13},
                   {line: line, column: 19},
                   {line: line, column: 25}]);
    });
  });

  it('should forbid unexpected indentation', function () {
    withLineNumber(function (line) {
      //!  Two spaces in the beginning of this row - wrong.
      positions(whitespace.indentation, comments.shift())
      .should.eql([{line: line}]);
    });

    withLineNumber(function (line) {
      //! This line's indentation is OK.
      //!   * Item 1.
      //!   * Item 2.
      //!      - Inner item.
      //!
      //!      - WRONG.
      //!   * Item 3.
      //!
      //!   * WRONG.
      //!
      positions(whitespace.indentation, comments.shift())
      .should.eql([{line: line + 5},
                   {line: line + 8}]);
    });

    withLineNumber(function (line) {
      /*!*
       *  WRONG
       */
      positions(whitespace.indentation, comments.shift())
      .should.eql([{line: line + 1}]);
    });
  });
});
