'use strict';

var advance = require('../util').advance;


var addPrefix = function (message) {
  return 'JSDoc format violation: ' + message;
};


/**
 * Error messages.
 * @readonly
 */
var messages = {
  tooShort: addPrefix('should be at least three lines long'),
  wrongStartingSequence: addPrefix('should start with "/**".'),
  startingSequenceNotAtLineEnd: addPrefix('first comment line should end after "/**".'),
  noAsteriskInLine: addPrefix('asterisk "*" not found.'),
  nonSpacesBeforeAsterisk: addPrefix('there should be spaces and spaces'
                                     + 'only before the first "*".'),
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
  var lines = comment.split('\n');

  var fallbackReturnValue = {
    format: 'jsdoc',
    lines: [],
    position: advance(location.start, {
      column: 2
    })
  };

  if (lines.length < 3) {
    report(messages.tooShort, location.start);
    // If first and last lines are separate, then it makes sense to check them before exit.
    if (lines.length < 2) {
      return fallbackReturnValue;
    }
  }

  var firstLine = lines[0]
    , lastLine = lines.slice(-1)[0];
  lines = lines.slice(1, -1);

  if (firstLine[2] != '*') {
    report(messages.wrongStartingSequence, location.start);
  }
  else if (firstLine.length != 3) {
    report(messages.startingSequenceNotAtLineEnd, advance(location.start, {
      column: 3
    }));
  }

  var spacing = location.start.column + 1;
  var bodyLines = [];

  lines = lines.forEach(function (line, index) {
    var lineIndex = location.start.line + index + 1;

    var asterisk = line.indexOf('*');
    if (asterisk == -1) {
      report(messages.noAsteriskInLine, {
        line: lineIndex
      });
      return;
    }

    var lineSpacing = line.match(/^\s*/)[0].length;
    if (lineSpacing != asterisk) {
      report(messages.nonSpacesBeforeAsterisk, {
        line: lineIndex,
        column: lineSpacing
      });
    }
    if (asterisk != spacing) {
      report(messages.asteriskIndentedNotAt(spacing), {
        line: lineIndex,
        column: asterisk
      });
    }

    if (line[asterisk + 1] && line[asterisk + 1] != ' ') {
      report(messages.noFirstSpace, {
        line: lineIndex,
        column: asterisk + 1
      });
      bodyLines.push(line.slice(asterisk + 1));
    }
    else {
      bodyLines.push(line.slice(asterisk + 2));
    }
  });

  var lastLineAsterisk = lastLine.length - 2;
  var lastLineSpacing = lastLine.match(/^\s*/)[0].length;
  if (lastLineSpacing != lastLineAsterisk) {
    report(messages.nonSpacesBeforeAsterisk, {
      line: location.end.line,
      column: lastLineSpacing
    });
  }
  if (lastLineAsterisk != spacing) {
    report(messages.asteriskIndentedNotAt(spacing), {
      line: location.end.line,
      column: lastLineAsterisk
    });
  }

  return bodyLines.length
       ? {format: 'jsdoc',
          lines: bodyLines,
          position: advance(location.start, {
            line: 1,
            column: 3
          })}
       : fallbackReturnValue;
};


module.exports.messages = messages;
