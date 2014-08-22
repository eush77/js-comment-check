var advance = require('../util').advance;


var addPrefix = function (message) {
  return 'Inline-block format violation: ' + message;
};


/**
 * Error messages.
 * @readonly
 */
var messages = {
  empty: addPrefix('can\'t be empty.'),
  noFirstSpace: addPrefix('no space after "/*".'),
  extraFirstSpace: addPrefix('more that a single space after "/*".'),
  noLastSpace: addPrefix('no space before "*/".'),
  extraLastSpace: addPrefix('more than a single space before "*/".')
};


/**
 * Format: inline-block.
 *
 * @type {FormatParser}
 */
module.exports = function (comment, location, report) {
  comment = comment.slice(2, -2);
  var position = advance(location.start, {
    column: 2
  });

  var trimmed = comment.trim();

  if (!trimmed.length) {
    report(messages.empty, position);
    comment = '';
  }

  if (comment[0] != ' ') {
    report(messages.noFirstSpace, position);
  }
  else {
    if (comment[1] == ' ') {
      report(messages.extraFirstSpace, position);
    }
    position.column += comment.match(/^\s+/)[0].length;
  }

  if (comment.slice(-1) != ' ') {
    report(messages.noLastSpace, advance(position, {
      column: comment.length
    }));
  }
  else if (comment.slice(-2) == '  ') {
    report(messages.extraLastSpace, advance(position, {
      column: trimmed.length
    }));
  }

  return {
    format: 'inline-block',
    lines: [trimmed],
    position: position
  };
};


module.exports.messages = messages;
