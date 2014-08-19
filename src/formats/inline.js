var advance = require('../util').advance;


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
    report('Inline format violation: no space after "//".', advance(location.start, {
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
