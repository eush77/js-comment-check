var advance = require('../util').advance;


/**
 * Format: jsdoc.
 *
 * @type {FormatParser}
 */
module.exports = function (comment, location, report) {
  report = (function () {
    var r = report;
    return function (message, position) {
      return r('JSDoc format violation: ' + message, position);
    };
  }());

  var pos = advance(location.start, {
    column: 3
  });
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
      report('first comment line should end after "/**".', advance(location.start, {
        column: 3
      }));
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
