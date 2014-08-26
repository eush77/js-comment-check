'use strict';

var gulp = require('gulp')
  , jshint = require('gulp-jshint')
  , mocha = require('gulp-mocha');


gulp.task('lint', function () {
  return gulp.src(['src/**/*.js', 'test/**/*.js', 'Gulpfile.js'])
             .pipe(jshint())
             .pipe(jshint.reporter('jshint-stylish'))
             .pipe(jshint.reporter('fail'));
});


gulp.task('test', function () {
  require('should');
  return gulp.src(['test/**/*.js', '!test/test-util.js'], {read: false})
             .pipe(mocha({
               reporter: 'spec'
             }));
});


gulp.task('default', ['lint', 'test']);
