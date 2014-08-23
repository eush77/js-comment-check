'use strict';
/* global describe, it */

var util = require('../src/util');

var formatParsers = {
  'inline': require('../src//formats/inline'),
  'inline-block': require('../src/formats/inline-block'),
  'jsdoc': require('../src/formats/jsdoc'),
};


/**
 * Some comments in this file are tests - those that start with "/*!" or "//!".
 * This variable lists them in the Array instance.
 * Individual comments are then shifted out along the way.
 */
var comments = util.extractMarkedComments(__filename, {parseFormat: false});


/**
 * Parse comment in a specific format and return the error positions along with the actual result.
 *
 * @arg {FormatParser} formatParser
 * @arg {text: string, loc: Location} comment
 * @return {output: Comment, errors: {message: string, position: Position}[]}
 */
var parseTheFormat = function (formatParser, comment) {
  var errors = [];
  var output = formatParser(comment.text, comment.loc, function (message, position) {
    errors.push({
      message: message,
      position: util.advance(position)
    });
  });
  return {
    output: output,
    errors: errors
  };
};


describe('Comment Formats', function () {
  describe('Inline', function () {
    var format = parseTheFormat.bind(null, formatParsers['inline']);
    var msg = formatParsers['inline'].messages;

    it('should extract comment body and location info', function () {
      util.withLineNumber(function (line) {
        //! hello
        format(comments.shift()).should.eql({
          output: {
            format: 'inline',
            lines: ['hello'],
            position: {
              line: line,
              column: 11
            }
          },
          errors: []
        });
      });

      util.withLineNumber(function (line) {
        //!    indented
        format(comments.shift()).should.eql({
          output: {
            format: 'inline',
            lines: ['   indented'],
            position: {
              line: line,
              column: 11
            }
          },
          errors: []
        });
      });
    });

    it('should check for format conformance', function () {
      util.withLineNumber(function (line) {
        //!tight
        format(comments.shift()).should.eql({
          output: {
            format: 'inline',
            lines: ['tight'],
            position: {
              line: line,
              column: 11
            }
          },
          errors: [{
            message: msg.noFirstSpace,
            position: {
              line: line,
              column: 10
            }
          }]
        });
      });
    });
  });

  describe('Inline Block', function () {
    var format = parseTheFormat.bind(null, formatParsers['inline-block']);
    var msg = formatParsers['inline-block'].messages;

    it('should extract comment body and location info', function () {
      util.withLineNumber(function (line) {
        /*! hello */
        format(comments.shift()).should.eql({
          output: {
            format: 'inline-block',
            lines: ['hello'],
            position: {
              line: line,
              column: 11
            }
          },
          errors: []
        });
      });
    });

    it('should check for format conformance', function () {
      util.withLineNumber(function (line) {
        /*!*/
        format(comments.shift()).should.eql({
          output: {
            format: 'inline-block',
            lines: [''],
            position: {
              line: line,
              column: 10
            }
          },
          errors: [{
            message: msg.empty,
            position: {
              line: line,
              column: 10
            }
          }]
        });
      });

      util.withLineNumber(function (line) {
        /*!tight*/
        format(comments.shift()).should.eql({
          output: {
            format: 'inline-block',
            lines: ['tight'],
            position: {
              line: line,
              column: 10
            }
          },
          errors: [{
            message: msg.noFirstSpace,
            position: {
              line: line,
              column: 10
            }
          }, {
            message: msg.noLastSpace,
            position: {
              line: line,
              column: 15
            }
          }]
        });
      });

      util.withLineNumber(function (line) {
        /*!  two  spaces  */
        format(comments.shift()).should.eql({
          output: {
            format: 'inline-block',
            lines: [' two  spaces '],
            position: {
              line: line,
              column: 11
            }
          },
          errors: [{
            message: msg.extraFirstSpace,
            position: {
              line: line,
              column: 10
            }
          }, {
            message: msg.extraLastSpace,
            position: {
              line: line,
              column: 23
            }
          }]
        });
      });
    });
  });

  describe('JSDoc', function () {
    var format = parseTheFormat.bind(null, formatParsers['jsdoc']);
    var msg = formatParsers['jsdoc'].messages;

    it('should extract comment body and location info', function () {
      util.withLineNumber(function (line) {
        /*!*
         * List:
         *   - first item,
         *   - second item.
         *
         * Last line.
         */
        format(comments.shift()).should.eql({
          output: {
            format: 'jsdoc',
            lines: ['List:',
                    '  - first item,',
                    '  - second item.',
                    '',
                    'Last line.'],
            position: {
              line: line + 1,
              column: 11
            }
          },
          errors: []
        });
      });
    });

    it('should check for format conformance', function () {
      util.withLineNumber(function (line) {
        /*!
      */
        format(comments.shift()).should.eql({
          output: {
            format: 'jsdoc',
            lines: [],
            position: {
              line: line,
              column: 10
            }
          },
          errors: [{
            message: msg.tooShort,
            position: {
              line: line,
              column: 8
            }
          }, {
            message: msg.wrongStartingSequence,
            position: {
              line: line,
              column: 8
            }
          }, {
            message: msg.asteriskIndentedNotAt(9),
            position: {
              line: line + 1,
              column: 6
            }
          }]
        });
      });

      util.withLineNumber(function (line) {
        /*!*  im bad
        **
        #
        #* line
         */
        format(comments.shift()).should.eql({
          output: {
            format: 'jsdoc',
            lines: ['*',
                    'line'],
            position: {
              line: line + 1,
              column: 11
            }
          },
          errors: [{
            message: msg.startingSequenceNotAtLineEnd,
            position: {
              line: line,
              column: 11
            }
          }, {
            message: msg.asteriskIndentedNotAt(9),
            position: {
              line: line + 1,
              column: 8
            }
          }, {
            message: msg.noFirstSpace,
            position: {
              line: line + 1,
              column: 9
            }
          }, {
            message: msg.noAsteriskInLine,
            position: {
              line: line + 2
            }
          }, {
            message: msg.nonSpacesBeforeAsterisk,
            position: {
              line: line + 3,
              column: 8
            }
          }]
        });
      });
    });
  });
});
