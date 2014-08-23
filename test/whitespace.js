'use strict';
/* global describe, it */

var whitespace = require('../src/rules/whitespace')
  , testUtil = require('./test-util');


/**
 * Some comments in this file are tests - those that start with "/*!" or "//!".
 * This variable lists them in the Array instance.
 * Individual comments are then shifted out along the way.
 */
var comments = testUtil.extractMarkedComments(__filename);


describe('Whitespace', function () {
  it('should forbid whitespace characters other than plain spaces', function () {
    testUtil.withLineNumber(function (line) {
      //! one tab\t, two tabs\t\t, three tabs and space in between\t\t \t - tabs
      testUtil.positions(whitespace.unconventionalWhitespace,
                         testUtil.decodeComment(comments.shift()))
      .should.eql([{line: line, column: 16},
                   {line: line, column: 27},
                   {line: line, column: 28},
                   {line: line, column: 62},
                   {line: line, column: 63},
                   {line: line, column: 65}]);
    });

    testUtil.withLineNumber(function (line) {
      //! vertical tab\x0b, form feed\f, carriage return\r - other unconventional ascii7
      testUtil.positions(whitespace.unconventionalWhitespace,
                         testUtil.decodeComment(comments.shift()))
      .should.eql([{line: line, column: 21},
                   {line: line, column: 33},
                   {line: line, column: 51}]);
    });

    testUtil.withLineNumber(function (line) {
      //! nbsp\xa0, ensp\u2002, emsp\u2003, ideographic space\u3000 - selected unicode space
      testUtil.positions(whitespace.unconventionalWhitespace,
                         testUtil.decodeComment(comments.shift()))
      .should.eql([{line: line, column: 13},
                   {line: line, column: 20},
                   {line: line, column: 27},
                   {line: line, column: 47}]);
    });

    testUtil.withLineNumber(function (line) {
      /*!*
       * \t\x0b\f\r\xa0\u2002\u2003\u3000
       */
      testUtil.positions(whitespace.unconventionalWhitespace,
                         testUtil.decodeComment(comments.shift()))
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
    testUtil.withLineNumber(function (line) {
      //! More  than   one    space, certainly!
      testUtil.positions(whitespace.spacesInARow, comments.shift())
      .should.eql([{line: line, column: 13},
                   {line: line, column: 19},
                   {line: line, column: 25}]);
    });
  });

  it('should forbid unexpected indentation', function () {
    testUtil.withLineNumber(function (line) {
      //!  Two spaces in the beginning of this row - wrong.
      testUtil.positions(whitespace.indentation, comments.shift())
      .should.eql([{line: line}]);
    });

    testUtil.withLineNumber(function (line) {
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
      testUtil.positions(whitespace.indentation, comments.shift())
      .should.eql([{line: line + 5},
                   {line: line + 8}]);
    });

    testUtil.withLineNumber(function (line) {
      /*!*
       *  WRONG
       */
      testUtil.positions(whitespace.indentation, comments.shift())
      .should.eql([{line: line + 1}]);
    });
  });
});
