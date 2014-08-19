var advance = require('./util').advance;


/**
 * @typedef {Object} Comment
 * @property {Format} format
 * @property {string[]} lines - Comment body.
 * @property {Position} position - Position of the comment's first character.
 */


/**
 * Comment format.
 * Possible values:
 *   - inline
 *   - inline-block
 *   - jsdoc
 *
 * @typedef {string} Format
 */


/**
 * @callback FormatParser
 * @arg {string} comment
 * @arg {Location} location
 * @arg {function(string, Position)} report - Callback to report errors.
 * @return {Comment}
 */


/**
 * Format -> parser mapping.
 *
 * @type {Object.<Format, FormatParser>}
 */
var formatParsers = {
  'inline': require('./formats/inline'),
  'inline-block': require('./formats/inline-block'),
  'jsdoc': require('./formats/jsdoc'),
};


/**
 * Recognize what format is the comment in.
 *
 * @arg {string} comment - Raw comment body string, including delimiters.
 * @return {Format}
 */
var getFormat = function (comment) {
  if (comment.slice(0, 2) == '//') {
    return 'inline';
  }
  else if (comment.indexOf('\n') < 0) {
    return 'inline-block';
  }
  else {
    return 'jsdoc';
  }
};


/**
 * Squash comment stream, whenever possible.
 *
 * @arg {Comment[]} comments
 * @return {Comment[]}
 */
var squash = function (comments) {
  var squashed = [], latestComment, latestPosition;

  comments.forEach(function (comment) {
    if (latestComment && comment.format == 'inline' &&
        comment.position.line == latestPosition.line + 1 &&
        comment.position.column == latestPosition.column) {
      [].push.apply(latestComment.lines, comment.lines);
      latestPosition.line += comment.lines.length;
    }
    else {
      if (latestComment) {
        squashed.push(latestComment);
      }
      if (comment.format == 'inline') {
        latestComment = comment;
        latestPosition = advance(comment.position, {
          line: comment.lines.length - 1,
        });
      }
      else {
        squashed.push(comment);
        latestComment = null;
      }
    }
  });

  if (latestComment) {
    squashed.push(latestComment);
  }
  return squashed;
};


/**
 * Cast comments to the right format.
 *
 * Valid options:
 *   - squash [= true]: whether squash comment stream after parsing or not.
 *
 * @arg {{text: string, loc: Location}[] | {text: string, loc: Location}} comments
 * @arg {function(string, Position)} report - Callback to report errors.
 * @arg {Object} [options]
 * @return {Comment[]}
 */
var parseFormat = function (comments, report, options) {
  options = options || {};
  if (options.squash == null) {
    options.squash = true;
  }

  if (!Array.isArray(comments)) {
    comments = [comments];
  }

  comments = comments.map(function (comment) {
    var format = getFormat(comment.text);
    return formatParsers[format](comment.text, comment.loc, report);
  });

  return options.squash ? squash(comments) : comments;
};


module.exports = parseFormat;
