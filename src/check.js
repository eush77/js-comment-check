var rules = require('./rules');


/**
 * Add positions together.
 * If an attribute is not set in either one of positions, it is skipped from result.
 *
 * @arg {Position} pos1
 * @arg {Position} pos2
 * @return {Position}
 */
var addPositions = function (pos1, pos2) {
  return ['line', 'column'].reduce(function (pos, attr) {
    if (pos1[attr] != null && pos2[attr] != null) {
      pos[attr] = pos1[attr] + pos2[attr];
    }
    return pos;
  }, {});
};


/**
 * Check that comments conform to the rules.
 *
 * @arg {Comment[]} comments - Array of comments.
 * @return {{message: string, position: Position}[]} Array of messages with corresponding positions.
 */
var check = function (comments) {
  var messages = [];

  comments.forEach(function (comment) {
    var shiftPosition = addPositions.bind(null, comment.position);

    rules.forEach(function (rule) {
      rule.check(comment.lines, function (pos) {
        messages.push({
          message: rule.message,
          position: shiftPosition(pos)
        });
      });
    });
  });

  return messages;
};


module.exports = check;
