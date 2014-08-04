module.exports = function (comment, error) {
  comment.split('\n').forEach(function (line, index) {
    if (/\s$/.test(line)) {
      error({
        line: index
      });
    }
  });
};
