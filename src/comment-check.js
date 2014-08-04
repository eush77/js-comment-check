var extract = require('./extract');

var fs = require('fs');


module.exports = function (filename) {
  var data = fs.readFileSync(filename);
  return extract(data);
};
