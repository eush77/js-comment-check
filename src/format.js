/**
 * @typedef {Object} Comment
 * @property {string} type - Comment format, one of "inline", "jsdoc".
 * @property {string[]} lines - Comment body.
 * @property {Position} position - Position of the comment's first character.
 */


/**
 * Squash inline comments together.
 *
 * @arg {Object[]} comments
 * @return {Object[]} Array of squashed comments in the same format.
 */
var squashCommentStream = function (comments) {
  var squashed = [], latest;

  comments.forEach(function (item) {
    if (latest && item.type == 'Line' &&
        item.loc.start.line == latest.loc.end.line + 1 &&
        item.loc.start.column == latest.loc.start.column) {
      latest.value += '\n' + item.value;
      latest.loc.end = item.loc.end;
    }
    else {
      if (latest) {
        squashed.push(latest);
      }
      if (item.type == 'Line') {
        latest = item;
      }
      else {
        squashed.push(item);
        latest = null;
      }
    }
  });

  if (latest) {
    squashed.push(latest);
  }
  return squashed;
};


/**
 * Cast comments to the right format.
 *
 * @arg {Object[]} comments - Squashed comments in the parser format.
 * @args {function(string, Position)} report - Callback to report errors.
 * @return {Comment[]}
 */
var recognizeFormat = (function () {
  var recognizeFormatByType = {
    'Line': function (comment, loc, report) {
      var pos = {
        line: loc.start.line,
        column: loc.start.column + 3
      };

      var lines = comment.split('\n').map(function (line, index) {
        if (line && line[0] != ' ') {
          report('Inline format violation: no space after "//".', {
            line: pos.line + index,
            column: pos.column - 1
          });
          return line;
        }
        else {
          return line.slice(1);
        }
      });

      return {
        type: 'inline',
        lines: lines,
        position: pos
      };
    },

    'Block': function (comment, loc, report) {
      var reportHere = function (message, position) {
        return report('JSDoc format violation: ' + message, position);
      };
      var pos = {
        line: loc.start.line,
        column: loc.start.column + 3
      };
      var spacing = new Array(pos.column - 1).join(' ');

      var lines = comment.split('\n');

      // TODO: Add support for one-line block comments.
      if (lines.length < 3) {
        reportHere('should be at least three lines long', loc.start);
      }

      if (lines[0] != '*') {
        if (lines[0][0] != '*') {
          reportHere('should start with "/**".', loc.start);
          lines[0] = spacing + '*' + lines[0];
        }
        else {
          reportHere('first comment line should end after "/**".', {
            line: loc.start.line,
            column: loc.start.column + 3
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
        reportHere('should end with "*/" indented with ' + spacing.length + ' space' + s + '.', {
          line: loc.end.line
        });
      }
      else {
        lines.pop();
      }

      lines = lines.map(function (line, index) {
        var asterisk = line.indexOf('*');
        if (asterisk < 0) {
          reportHere('asterisk "*" not found.', {
            line: pos.line + index
          });
          // asterisk == -1 at this point.
        }
        else if (!/^ +$/.test(line.slice(0, asterisk))) {
          reportHere('there should be spaces and spaces only before the first "*".', {
            line: pos.line + index
          });
        }
        else if (asterisk != spacing.length) {
          reportHere('wrong spacing, should be ' + spacing.length + '.', {
            line: pos.line + index
          });
        }
        line = line.slice(asterisk + 1);
        if (line && line[0] != ' ') {
          reportHere('no space after "*".', {
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
        type: 'jsdoc',
        lines: lines,
        position: pos
      };
    }
  };

  return function (comments, report) {
    var result = [];

    comments.forEach(function (comment) {
      if (recognizeFormatByType[comment.type]) {
        result.push(recognizeFormatByType[comment.type](comment.value, comment.loc, report));
      }
      else {
        report('Unrecognized format.', comment.loc.start);
      }
    });

    return result;
  };
}());


/**
 * @arg {{text: string, loc: Location}[] | {text: string, loc: Location}} comments
 * @arg {function(string, Position)} report - Callback to report errors.
 * @return {Comment[]}
 */
var parseFormat = function (comments, report) {
  if (!Array.isArray(comments)) {
    comments = [comments];
  }

  // TODO: Don't do that!
  comments = comments.map(function (comment) {
    if (comment.text.slice(0, 2) == '//') {
      var type = 'Line';
      var value = comment.text.slice(2);
    }
    else {
      var type = 'Block';
      var value = comment.text.slice(2, -2);
    }

    return {
      type: type,
      value: value,
      loc: comment.loc
    };
  });

  return recognizeFormat(squashCommentStream(comments), report);
};


module.exports = parseFormat;
