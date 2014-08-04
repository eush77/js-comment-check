var extractComments = require('./extract'),
    check = require('./check');

var fs = require('fs');


module.exports = function (filename) {
  var data = fs.readFileSync(filename);
  var comments = extractComments(data);
  var messages = check(comments);
  return messages;
};
