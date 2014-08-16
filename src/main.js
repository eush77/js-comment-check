var extract = require('./extract'),
    parseFormat = require('./parse-format'),
    check = require('./check'),
    advance = require('./util').advance;


/**
 * Reporter that saves all messages in array.
 * Actually reporters built this way are perfect arrays themselves.
 * The only difference is "fn" bound method that serves as a reporting callback meant to be passed.
 *
 * @constructor
 * @arg {number} [limit=Infinity] - Maximal number of messages to save,
 *                                  others will be silently ignored.
 */
var MessageArrayReporter = function (limit) {
  if (limit == null) {
    limit = Infinity;
  }

  var self = [];

  return Object.defineProperty(self, 'fn', {
    enumerable: true,
    value: function (message, position) {
      if (self.length < limit) {
        // Copy position in order to protect from its future mutations.
        self.push({
          message: message,
          position: advance(position)
        });
      }
    }
  });
};


/**
 * Check comments in the code for rule violations.
 *
 * Valid options:
 *   - limit: maximal number of messages to return,
 *       note that messages may appear out of order (still sorted though).
 *
 * @arg {string} code - JavaScript code.
 * @arg {Object} [options]
 * @return {{message: string, position: Position}[]} Array of messages, sorted by position.
 */
var checkComments = function (code, options) {
  options = options || {};

  var reporter = new MessageArrayReporter(options.limit);

  var comments = parseFormat(extract(code), reporter.fn);
  check(comments, reporter.fn);

  // Sort first by line, then by column.
  return reporter.sort(function (a, b) {
    return (a.position.line != b.position.line)
      ? a.position.line - b.position.line
      : (a.position.column || 0) - (b.position.column || 0);
  });
};


module.exports = checkComments;
