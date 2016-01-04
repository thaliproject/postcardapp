#!/usr/bin/env node

module.exports = function(context) {
  var Q = context.requireCordovaModule('q');
  var deferral = new Q.defer();

  var fs = require('fs'),
      path = require('path'),
      gulp = require('gulp'),
      gulpfile = path.join(__dirname, 'gulpfile');
  require(gulpfile);

  // 'task_stop'
  gulp.start('cordova:build').once('task_stop', function(e){
    console.log(process.cwd(), e.task, 'gulp task done');
    //deferral.resolve(); // should resolve after last build task is completed
    // Note: Using a workaround to check for gulp script is completed using a semaphore file as 'task_stop' event fires after first task and not after all tasks have been completed.
    var inter = setInterval(function(){
      if ( fs.existsSync('www/jxcore/version.txt') ) {
        console.log("Ok, all gulp tasks should be completed.");
        clearInterval(inter);
        deferral.resolve();
      }
    },1000);
  });

  return deferral.promise;
}
