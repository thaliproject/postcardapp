#!/usr/bin/env node

module.exports = function(context) {
  var Q = context.requireCordovaModule('q');
  var deferral = new Q.defer();

  var path = require('path'),
      gulp = require('gulp'),
      gulpfile = path.join(__dirname, 'gulpfile');
  require(gulpfile);

  gulp.start('cordova:build').once('task_stop', function(){
    console.log(process.cwd(), 'gulp task done');
    deferral.resolve();
  });

  return deferral.promise;
}
