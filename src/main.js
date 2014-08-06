var extract = require('./extract'),
    check = require('./check');


/**
 * Reporter that saves all messages in array.
 * Actually reporters built this way are perfect arrays themselves.
 * The only difference is "fn" bound method that serves as a reporting callback meant to be passed.
 *
 * @constructor
 */
var MessageArrayReporter = function () {
  var self = [];

  return Object.defineProperty(self, 'fn', {
    enumerable: true,
    value: function (message, position) {
      self.push({
        message: message,
        position: position
      });
    }
  });
};


/**
 * Check comments in the code for rule violations.
 *
 * @arg {string} code - JavaScript code.
 * @return {{message: string, position: Position}[]} Array of messages, sorted by position.
 */
var checkComments = function (code) {
  var reporter = new MessageArrayReporter();

  var comments = extract(code, reporter.fn);
  check(comments, reporter.fn);

  // Sort first by line, then by column.
  return reporter.sort(function (a, b) {
    return (a.position.line != b.position.line)
      ? a.position.line - b.position.line
      : (a.position.column || 0) - (b.position.column || 0);
  });
};


module.exports = checkComments;
