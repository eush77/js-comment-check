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
 * @arg {Comment} comment - Comment to check.
 * @arg {function(Position)} report - Callback to report if rule is violated.
 */


/**
 * List of rules to apply.
 *
 * @type {Rule[]}
 */
module.exports = [
  {
    message: 'Unconventional whitespace (only spaces and newlines allowed).',
    check: require('./rules/whitespace').unconventionalWhitespace
  },
  {
    message: 'Several spaces in a row between words.',
    check: require('./rules/whitespace').spacesInARow
  },
  {
    message: 'Wrong indentation.',
    check: require('./rules/whitespace').indentation
  },
];
