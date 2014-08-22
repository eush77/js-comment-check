var advance = require('../util').advance;


/**
 * Error messages.
 * @readonly
 */
var messages = {
  noFirstSpace: 'Inline format violation: no space after "//".'
};


/**
 * Format: inline.
 *
 * @type {FormatParser}
 */
module.exports = function (comment, location, report) {
  if (comment[2] == ' ' || comment[2] == null) {
    comment = comment.slice(3);
  }
  else {
    report(messages.noFirstSpace, advance(location.start, {
      column: 2
    }));
    comment = comment.slice(2);
  }

  return {
    format: 'inline',
    lines: [comment],
    position: advance(location.start, {
      column: 3
    }),
  };
};


module.exports.messages = messages;
