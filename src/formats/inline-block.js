var advance = require('../util').advance;


/**
 * Format: inline-block.
 *
 * @type {FormatParser}
 */
module.exports = function (comment, location, report) {
  report = (function () {
    var r = report;
    return function (message, position) {
      return r('Inline-block format violation: ' + message, position);
    };
  }());

  comment = comment.slice(2, -2);
  var position = advance(location.start, {
    column: 2
  });

  var trimmed = comment.trim();

  if (!trimmed.length) {
    report('can\'t be empty.', position);
    comment = '';
  }

  if (comment[0] != ' ') {
    report('no space after "/*".', position);
  }
  else {
    if (comment[1] == ' ') {
      report('more that a single space after "/*".', position);
    }
    position.column += comment.match(/^\s+/)[0].length;
  }

  if (comment.slice(-1) != ' ') {
    report('no space before "*/".', advance(position, {
      column: comment.length
    }));
  }
  else if (comment.slice(-2) == '  ') {
    report('more than a single space before "*/".', advance(position, {
      column: trimmed.length
    }));
  }

  return {
    format: 'inline-block',
    lines: [trimmed],
    position: position
  };
};
