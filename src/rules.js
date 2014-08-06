/**
 * Rule to apply.
 *
 * @typedef {Object} Rule
 * @property {string} message - Rule message to be shown on violation.
 * @property {RuleChecker} check - Function that checks for violations.
 */


/**
 * Rule checker function.
 *
 * @callback RuleChecker
 * @arg {string[]} lines - Comment body.
 * @arg {function(Position)} report - Callback to report if rule is violated.
 */


/**
 * List of rules to apply.
 *
 * @type {Rule[]}
 */
module.exports = [
  {
    message: 'Trailing space.',
    check: require('./rules/trailing-space')
  },
];
