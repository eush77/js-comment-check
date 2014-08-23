'use strict';


/**
 * Advance position by increment.
 * That is, add increment.line to position.line and increment.column to position.column.
 * Return a fresh position.
 *
 * If a property does not exist in position, it is skipped.
 * If a property does not exist in increment, it is left unchanged.
 * Note that this behaviour makes the function sensitive to the order of arguments (noncommutative).
 *
 * If the second argument is omitted, effectively make a copy of the original position.
 *
 * @arg {Position} position
 * @arg {Position} [increment]
 * @return {Position}
 */
exports.advance = function (position, increment) {
  increment = increment || {};
  var result = Object.create(null);

  if (position.line != null) {
    result.line = position.line + (increment.line || 0);
  }
  if (position.column != null) {
    result.column = position.column + (increment.column || 0);
  }

  return result;
};
