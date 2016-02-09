#!/usr/bin/env node

module.exports = function(context) {
  var Q = context.requireCordovaModule('q');
  var deferral = new Q.defer();

  var fs = require('fs'),
      path = require('path'),
      gulp = require('gulp'),
      gulpfile = path.join(__dirname, 'gulpfile');
  require(gulpfile);


  // default gulp task with cordova build hook
  var gulpTask = 'cordova:build';
  if (context.hook === 'after_prepare' ){
    if (context.opts.platforms.length === 1){
      gulpTask = 'cordova:'+context.opts.platforms[0];
    } else if (context.opts.platforms.length>1) {
      // warn when using 'cordova build' as this command targets mutiple platforms (android,ios) and you can't copy specific cordova platform plugins into build with this multi-platform hook.
      console.warn("Warning: Please run 'cordova build ios' or 'cordova build android' after");
    }
  }
  console.log("start gulp task:", gulpTask);

  var semaphoreFile = 'www/jxcore/version.txt'; // semaphore for gulp task done
  gulp.start(gulpTask).once('task_stop', function(e){
    //console.log(process.cwd(), e.task, 'gulp task done');
    //deferral.resolve(); // should resolve after last build task is completed
    // Note: Using a workaround to check for gulp script is completed using a semaphore file as 'task_stop' event fires after first task and not after all tasks have been completed.
    var inter = setInterval(function(){
      if ( fs.existsSync(semaphoreFile) ) {
        console.log(gulpTask, "should be completed.");
        clearInterval(inter);
        fs.unlinkSync(semaphoreFile);
        deferral.resolve();
      }
    },1000);
  });

  return deferral.promise;
}
