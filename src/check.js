var RULES = require('./rules/rules.json');


/**
 * Load rule by name.
 *
 * @arg {string} name - Rule name.
 * @return {function}
 */
var loadRule = function (name) {
  return require('./rules/' + name);
};


RULES.forEach(function (rule) {
  rule.check = loadRule(rule.name);
});


/**
 * Add locations together.
 * If an attribute is not set in either one of locations, it is skipped from result.
 *
 * @arg {Object} loc1
 * @arg {Object} loc2
 * @return {Object}
 */
var addLoc = function (loc1, loc2) {
  var loc = {};
  if (loc1.line != null && loc2.line != null) {
    loc.line = loc1.line + loc2.line;
  }
  if (loc1.column != null && loc2.column != null) {
    loc.column = loc1.column + loc2.column;
  }
  return loc;
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
