module.exports = function (lines, report) {
  lines.forEach(function (line, index) {
    if (/\s$/.test(line)) {
      report({
        line: index
      });
    }
  });
};
