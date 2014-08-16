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
 * Format -> parser mapping.
 *
 * @type {Object.<Format, FormatParser>}
 */
var formatParsers = {};


/**
 * Format: inline.
 *
 * @type {FormatParser}
 */
formatParsers['inline'] = function (comment, location, report) {
  if (comment[2] == ' ' || comment[2] == null) {
    comment = comment.slice(3);
  }
  else {
    report('Inline format violation: no space after "//".', {
      line: location.start.line,
      column: location.start.column + 2
    });
    comment = comment.slice(2);
  }

  return {
    format: 'inline',
    lines: [comment],
    position: {
      line: location.start.line,
      column: location.start.column + 3
    }
  };
};


/**
 * Format: inline-block.
 *
 * @type {FormatParser}
 */
formatParsers['inline-block'] = function (comment, location, report) {
  report = (function () {
    var r = report;
    return function (message, position) {
      return r('Inline-block format violation: ' + message, position);
    };
  }());

  comment = comment.slice(2, -2);
  var position = {
    line: location.start.line,
    column: location.start.column + 2
  };

  var trimmed = comment.trim();

  if (!trimmed.length) {
    report('can\'t be empty.', position);
    comment = '';
  }

  if (comment[0] != ' ') {
    report('no space after "/*".', position);
  }
  else {
    if (comment[1] == ' ') {
      report('more that a single space after "/*".', position);
    }
    position.column += comment.match(/^\s+/)[0].length;
  }

  if (comment.slice(-1) != ' ') {
    report('no space before "*/".', {
      line: position.line,
      column: position.column + comment.length
    });
  }
  else if (comment.slice(-2) == '  ') {
    report('more than a single space before "*/".', {
      line: position.line,
      column: position.column + trimmed.length
    });
  }

  return {
    format: 'inline-block',
    lines: [trimmed],
    position: position
  };
};


/**
 * Format: jsdoc.
 *
 * @type {FormatParser}
 */
formatParsers['jsdoc'] = function (comment, location, report) {
  report = (function () {
    var r = report;
    return function (message, position) {
      return r('JSDoc format violation: ' + message, position);
    };
  }());

  var pos = {
    line: location.start.line,
    column: location.start.column + 3
  };
  var spacing = new Array(pos.column - 1).join(' ');

  var lines = comment.slice(2, -2).split('\n');

  if (lines.length < 3) {
    report('should be at least three lines long', location.start);
  }

  if (lines[0] != '*') {
    if (lines[0][0] != '*') {
      report('should start with "/**".', location.start);
      lines[0] = spacing + '*' + lines[0];
    }
    else {
      report('first comment line should end after "/**".', {
        line: location.start.line,
        column: location.start.column + 3
      });
      lines[0] = spacing + lines[0];
    }
  }
  else {
    lines.shift();
    pos.line += 1;
  }

  if (lines.slice(-1) != spacing) {
    var s = (spacing.length == 1) ? '' : 's';
    report('should end with "*/" indented with ' + spacing.length + ' space' + s + '.', {
      line: location.end.line
    });
  }
  else {
    lines.pop();
  }

  lines = lines.map(function (line, index) {
    var asterisk = line.indexOf('*');
    if (asterisk < 0) {
      report('asterisk "*" not found.', {
        line: pos.line + index
      });
      // asterisk == -1 at this point.
    }
    else if (!/^ +$/.test(line.slice(0, asterisk))) {
      report('there should be spaces and spaces only before the first "*".', {
        line: pos.line + index
      });
    }
    else if (asterisk != spacing.length) {
      report('wrong spacing, should be ' + spacing.length + '.', {
        line: pos.line + index
      });
    }
    line = line.slice(asterisk + 1);
    if (line && line[0] != ' ') {
      report('no space after "*".', {
        line: pos.line,
        column: asterisk
      });
      return line || '';
    }
    else {
      return line.slice(1);
    }
  });

  return {
    format: 'jsdoc',
    lines: lines,
    position: pos
  };
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
        latestPosition = {
          line: comment.position.line + comment.lines.length - 1,
          column: comment.position.column
        };
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
