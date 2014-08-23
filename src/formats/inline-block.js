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

  if (!comment.length) {
    report(messages.empty, position);
  }
  else {
    if (comment[0] != ' ') {
      report(messages.noFirstSpace, position);
    }
    else {
      if (comment[1] == ' ') {
        report(messages.extraFirstSpace, position);
      }
      position.column += 1;
      comment = comment.slice(1);
    }

    if (comment.slice(-1) != ' ') {
      report(messages.noLastSpace, advance(position, {
        column: comment.length
      }));
    }
    else {
      if (comment.slice(-2)[0] == ' ') {
        report(messages.extraLastSpace, advance(position, {
          column: comment.length - comment.match(/\s+$/)[0].length
        }));
      }
      comment = comment.slice(0, -1);
    }
  }

  return {
    format: 'inline-block',
    lines: [comment],
    position: position
  };
};


module.exports.messages = messages;
