#!/usr/bin/env node

module.exports = function(context) {
  var path = require('path'),
      gulp = require('gulp'),
      gulpfile = path.join(__dirname, 'gulpfile');
  require(gulpfile);

  gulp.start('cordova:build').once('task_stop', function(){
    console.log(process.cwd(), 'gulp task done');
  });
}
