var advance = require('../util').advance;


var addPrefix = function (message) {
  return 'JSDoc format violation: ' + message;
};


/**
 * Error messages.
 */
var messages = {
  tooShort: addPrefix('should be at least three lines long'),
  wrongStartingSequence: addPrefix('should start with "/**".'),
  startingSequenceNotAtLineEnd: addPrefix('first comment line should end after "/**".'),
  endingSequenceIndentedNotAt: function (indent) {
    var s = (indent == 1) ? '' : 's';
    return addPrefix('should end with "*/" indented with ' + indent + ' space' + s + '.');
  },
  noAsteriskInLine: addPrefix('asterisk "*" not found.'),
  nonSpacesBeforeAsterisk: addPrefix('there should be spaces and spaces only before the first "*".'),
  asteriskIndentedNotAt: function (indent) {
    return addPrefix('wrong spacing, should be ' + indent + '.');
  },
  noFirstSpace: addPrefix('no space after "*".')
};


/**
 * Format: jsdoc.
 *
 * @type {FormatParser}
 */
module.exports = function (comment, location, report) {
  var pos = advance(location.start, {
    column: 3
  });
  var spacing = new Array(pos.column - 1).join(' ');

  var lines = comment.slice(2, -2).split('\n');

  if (lines.length < 3) {
    report(messages.tooShort, location.start);
  }

  if (lines[0] != '*') {
    if (lines[0][0] != '*') {
      report(messages.wrongStartingSequence, location.start);
      lines[0] = spacing + '*' + lines[0];
    }
    else {
      report(messages.startingSequenceNotAtLineEnd, advance(location.start, {
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
    report(messages.endingSequenceIndentedNotAt(spacing.length), {
      line: location.end.line
    });
  }
  else {
    lines.pop();
  }

  lines = lines.map(function (line, index) {
    var asterisk = line.indexOf('*');
    if (asterisk < 0) {
      report(messages.noAsteriskInLine, {
        line: pos.line + index
      });
      // asterisk == -1 at this point.
    }
    else if (!/^ +$/.test(line.slice(0, asterisk))) {
      report(messages.nonSpacesBeforeAsterisk, {
        line: pos.line + index
      });
    }
    else if (asterisk != spacing.length) {
      report(messages.asteriskIndentedNotAt(spacing.length), {
        line: pos.line + index
      });
    }
    line = line.slice(asterisk + 1);
    if (line && line[0] != ' ') {
      report(messages.noFirstSpace, {
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


module.exports.messages = messages;
