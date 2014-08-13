var extract = require('../src/extract'),
    format = require('../src/format'),
    whitespace = require('../src/rules/whitespace');

var stackTrace = require('stack-trace');

var fs = require('fs');


var comments = format(extract(fs.readFileSync(__filename).toString()));


var decode = function (comment) {
  comment.lines = comment.lines.map(function (string) {
    if (string.indexOf('"') >= 0) {
      throw new Error('Could not decode.');
    }
    return eval('"' + string + '"');
  });

  return comment;
};


var ColumnArrayReporter = function () {
  var columns = [];

  return Object.defineProperty(columns, 'fn', {
    value: function (position) {
      columns.push(position.column);
    }
  });
};


describe('Whitespace', function () {
  it('should forbid whitespace characters other than plain spaces', function () {
    var columns = new ColumnArrayReporter();

    // one tab\t, two tabs\t\t, three tabs and space in between\t\t \t - tabs
    columns.splice(0, Infinity);
    whitespace.unconventionalWhitespace(decode(comments.shift()), columns.fn);
    columns.should.eql([14, 25, 26, 60, 61, 63]);

    // vertical tab\x0b, form feed\f, carriage return\r - other unconventional ascii7
    columns.splice(0, Infinity);
    whitespace.unconventionalWhitespace(decode(comments.shift()), columns.fn);
    columns.should.eql([19, 31, 49]);

    // nbsp\xa0, ensp\u2002, emsp\u2003, ideographic space\u3000 - selected unicode space
    columns.splice(0, Infinity);
    whitespace.unconventionalWhitespace(decode(comments.shift()), columns.fn);
    columns.should.eql([11, 18, 25, 45]);

    /**
     * \t\x0b\f\r\xa0\u2002\u2003\u3000
     */
    columns.splice(0, Infinity);
    whitespace.unconventionalWhitespace(decode(comments.shift()), columns.fn);
    columns.should.eql([7, 8, 9, 10, 11, 12, 13, 14]);
  });

  it('should forbid more than a single space between words', function () {
    var columns = new ColumnArrayReporter();

    // More  than   one    space, certainly!
    columns.splice(0, Infinity);
    whitespace.spacesInARow(comments.shift(), columns.fn);
    columns.should.eql([11, 17, 23]);
  });

  it('should forbid unexpected indentation', function () {
    var itLine = stackTrace.get()[0].getLineNumber() - 1;

    var positions = [];

    //  Two spaces in the beginning of this row - wrong.
    positions.splice(0, Infinity);
    whitespace.indentation(comments.shift(), [].push.bind(positions));
    positions.should.eql([{line: itLine + 5}]);

    // This line's indentation is OK.
    //   * Item 1.
    //   * Item 2.
    //      - Inner item.
    //
    //      - WRONG.
    //   * Item 3.
    //
    //   * WRONG.
    //
    positions.splice(0, Infinity);
    whitespace.indentation(comments.shift(), [].push.bind(positions));
    positions.should.eql([{line: itLine + 15},
                          {line: itLine + 18}]);

    /**
     *  WRONG
     */
    positions.splice(0, Infinity);
    whitespace.indentation(comments.shift(), [].push.bind(positions));
    positions.should.eql([{line: itLine + 26}]);
  });
});
