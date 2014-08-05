/**
 * List of rules to apply.
 * @readonly
 */
var RULES = (function (list) {
  return list.map(function (rule) {
    rule.check = require('./rules/' + rule.name);
    return rule;
  });
}(require('./rules/rules.json')));


/**
 * Add locations together.
 * If an attribute is not set in either one of locations, it is skipped from result.
 *
 * @arg {Object} loc1
 * @arg {Object} loc2
 * @return {Object}
 */
var addLoc = function (loc1, loc2) {
  return ['line', 'column'].reduce(function (loc, attr) {
    if (loc1[attr] != null && loc2[attr] != null) {
      loc[attr] = loc1[attr] + loc2[attr];
    }
    return loc;
  }, {});
};


/**
 * Check that comments conform to the rules.
 *
 * @arg {Array} Array of comments.
 * @return {Object.<message, loc>[]} Array of messages with corresponding locations.
 */
var check = function (comments) {
  var messages = [];

  comments.forEach(function (comment) {
    var shiftLoc = addLoc.bind(null, comment.loc.start);

    RULES.forEach(function (rule) {
      rule.check(comment.value, function (loc) {
        messages.push({
          message: rule.message,
          loc: shiftLoc(loc)
        });
      });
    });
  });

  return messages;
};


module.exports = check;
