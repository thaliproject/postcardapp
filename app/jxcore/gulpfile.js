'use strict';

var path = require('path'),
    fs = require('fs'),
    gulp = require ('gulp'),
    dest = require('gulp-dest'),
    file = require('gulp-file'),
    rename = require("gulp-rename"),
    runSequence = require('run-sequence'),
    replace = require('gulp-replace'),
    vulcanize = require('gulp-vulcanize'),
    crisper = require('gulp-crisper'),
    injectString = require('gulp-inject-string'),
    tap = require('gulp-tap'),
    del = require('del'),
    uglify = require('gulp-uglify'),
    htmlmin = require('gulp-html-minifier'),
    minifyInline = require('gulp-minify-inline'),
    cheerio = require('gulp-cheerio'),
    exec = require('child_process').exec;

// default paths (from gulpfile.js dir) for `gulp build`
var paths = {
  base: '.',
  src: '',
  build: '../../www/jxcore/',
};

// The default task (called when you run `gulp`)
gulp.task('default', ['build']);

gulp.task('cordova:build', ['cordova:config','build']);

// Configure working paths (from root project dir) for `cordova build`
gulp.task('cordova:config', function(){
  paths = {
    base: 'app/jxcore/',
    src: 'app/jxcore/',
    build: 'www/jxcore/',
  };
  console.log("cwd:", process.cwd());
  return;
});

// Create semaphore file to show gulp build tasks are completed
gulp.task('cordova:semaphore', function(){
  var pkg = JSON.parse(fs.readFileSync(paths.src+'package.json'));
  var str = 'Build version: '+pkg.version;
  //console.log(str);
  return file('version.txt',str,{src:true}).pipe(gulp.dest(paths.build));
});

gulp.task('cordova:clean', function(cb){
  return del(paths.build+'version.txt', {force: true}, cb);
});

// One-off tasks (unless dist build dir is cleaned)
gulp.task('copy:node_modules', function(){
  // check if node_modules exists
  if ( fs.existsSync(paths.build+'node_modules') ) {
    console.log("node_modules exists, skipping...");
    return;
  }

  var pkg = JSON.parse(fs.readFileSync(paths.src+'package.json'));
  console.log("Package:", pkg.name);

  function getKeys(object, prefix, suffix) {
    var keys = [];
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        keys.push(prefix+key+suffix);
      }
    }
    return keys;
  }

  var node_modules = getKeys(pkg.dependencies, paths.src+'node_modules/', '/**/*');

  console.log("Copy dependencies", node_modules);
  return gulp.src(node_modules,{dot:true,base:paths.base}).pipe(gulp.dest(paths.build));
});

// Repeated tasks
gulp.task('build', function(cb){
  // check if 'thali.jx' exists
  if ( fs.existsSync(paths.build+'thali.jx') ) {
    console.log("Building with 'thali.jx' archive found in jxcore dir.");
    console.log("Note: Use 'gulp clean' and 'gulp build' to rebuild.");
    return;
  }
  console.log(process.cwd(), "paths src:", paths.src, "build:", paths.build);
  runSequence(
    'cordova:clean',
    'copy:node_modules',
    // 'trim:node_modules',
    'copy:express',
    'copy:assets',
    'index:removeServerScripts',
    'index:mobile',
    //'index:debug',
    'index:vulcanize',
    'index:injectCordovaScript',
    'minify:js',
    'minify:html',
    // 'clean:tmp',
    'cordova:semaphore',
    cb);
});

gulp.task('copy:express', function(){
  return gulp.src([
      paths.src+'app.js',
      paths.src+'routes/*'
    ],{
      dot: true,
      base: paths.base
    })
    .pipe(gulp.dest(paths.build));
});

gulp.task('copy:assets', function(){
  return gulp.src([
      paths.src+'public/favicon.ico',
      paths.src+'public/bower_components/font-roboto/RobotoTTF/*'
    ],{
      dot: true,
      base: paths.base
    })
    .pipe(gulp.dest(paths.build));
});

// set app config vars
gulp.task('index:mobile', function(){
  return gulp.src(paths.src+'public/index.html.tmp')
    .pipe(replace(/(var\sIS_MOCKMOBILE\s=\s)(true)/g, '$1false'))
    .pipe(gulp.dest(paths.src+'public'));
});

gulp.task('index:debug', function(){
  return gulp.src(paths.src+'public/index.html.tmp')
    .pipe(replace(/(var\sIS_DEBUG\s=\s)(.*)/g, '$1true'))
    .pipe(gulp.dest(paths.src+'public'));
});

// workaround for vulcanize server script error finding socket.io/socket.io.js
gulp.task('index:removeServerScripts', function(){
  var start_comment = "gulp:remove",
      end_comment = "gulp:endremove",
      pattern = new RegExp("(\\<!--\\s" + start_comment + "\\s--\\>)(.*\\n)*(\\<!--\\s" + end_comment + "\\s--\\>)", "g");
  return gulp.src(paths.src+'public/index.html')
    .pipe(tap(function(file) {
      file.contents = new Buffer(String(file.contents).replace(pattern, ""));
    }))
    .pipe(rename({extname:'.html.tmp'}))
    .pipe(gulp.dest(paths.src+'public'));
});

// vulcanize _index.html -p "public/" -o public/build.html --csp --strip-comments
gulp.task('index:vulcanize', function(){
  return gulp.src(paths.src+'public/index.html')
    // NB: vulcanize inputUrl is required but overrides the gulp.src file input
    .pipe(vulcanize({
      inputUrl: '/index.html.tmp',
      abspath: path.resolve(paths.src+'public'),
      stripComments: true,
      stripExcludes: false,
      excludes: ['//fonts.googleapis.com/*'],
      inlineCss: true,
      inlineScripts: true,
    }))
    .pipe(crisper({
      scriptInHead: true,
      onlySplit: false
    }))
    .pipe(injectString.before(
      '<template id="socketio">',
      '<script src="/socket.io/socket.io.js"></script>' +
      '<script>var socket = io.connect("http://localhost:5000");</script>'))
    //.pipe(rename({extname:'.html'}))
    .pipe(gulp.dest(paths.build+'public'));
});

// inject cordova script
gulp.task('index:injectCordovaScript', function(){
  return gulp.src(paths.build+'public/index.html')
    .pipe(replace(
      '<meta data-script="cordova.js">',
      '<script type="text/javascript" charset="utf-8" src="cordova.js"></script>'))
    .pipe(gulp.dest(paths.build+'public'));
});

gulp.task('minify:js', function(){
  return gulp.src(paths.build+'public/*.js')
    .pipe(uglify({
      mangle: true,
    }))
    .pipe(gulp.dest(paths.build+'public'));
});

gulp.task('minify:html', function(){
  return gulp.src(paths.build+'public/*.html')
    .pipe(htmlmin({
      //minifyCSS: true,
      //minifyJS: true,
      collapseWhitespace: true,
      removeComments: true,
      removeCommentsFromCDATA: true,
      caseSensitive: true,
      customAttrAssign: [/\$=/],
    }))
    // .pipe(minifyInline({
    //   css: {
    //     advanced: false,
    //     aggressiveMerging: false,
    //     keepSpecialComments: 0,
    //     debug: false,
    //     mediaMerging: false,
    //     roundingPrecision: -1,
    //     processImport: false
    //   }
    // }))
    // .pipe(cheerio(function ($, file) {
    //   $('style').each(function(){
    //     $(this).text( $(this).text()
    //       .replace(/[\t\n\r]+/g, '') // remove extra whitespace
    //       .replace(/[\s]+/g, ' ') // reduce to single space
    //     );
    //   });
    // }))
    .pipe(gulp.dest(paths.build+'public'));
});

// Copy Cordova javascript and plugin source into the JXcore app's 'public' dir
gulp.task('cordova:android', ['cordova:config','build:android']);
gulp.task('cordova:ios', ['cordova:config','build:ios']);

gulp.task('build:android', function(cb){
  return runSequence(
    'cordova:clean',
    'cordova:cleanCordovaScripts',
    'cordova:androidCopyCordovaScripts',
    'cordova:semaphore',
    cb);
});

gulp.task('build:ios', function(cb){
  return runSequence(
    'cordova:clean',
    'cordova:cleanCordovaScripts',
    'cordova:iosCopyCordovaScripts',
    'cordova:semaphore',
    cb);
});

// remove platform specific Cordova source before building
gulp.task('cordova:cleanCordovaScripts', function(cb){
  console.log("Clean Cordova platform source:", paths.build);
  var removables = [
      paths.build+'public/cordova.js',
      paths.build+'public/cordova_plugins.js',
      paths.build+'public/plugins/**/*',
      paths.build+'public/cordova-js-src/**/*'
    ];
  return del(removables, {force: true}, cb);
});

gulp.task('cordova:androidCopyCordovaScripts', function(cb){
  return copyCordovaScripts(cb,'platforms/android/assets/www/');
});

gulp.task('cordova:iosCopyCordovaScripts', function(cb){
  return copyCordovaScripts(cb,'platforms/ios/www/');
});

var copyCordovaScripts = function(cb, path) {
  console.log("copy Cordova scripts and plugins from:", path);
  // NB: Cordova source paths may not exist during initial 'cordova platform add ...'
  return gulp.src([
      path+'cordova.js',
      path+'cordova_plugins.js',
      path+'plugins/**/*',
      path+'cordova-js-src/**/*'
    ],
    {
      dot: true,
      base: path
    })
    .pipe(gulp.dest(paths.build+'public'), cb);
};

// clean tmp working files
gulp.task('clean:tmp', function(){
  return del([
    paths.src+'public/**/*.tmp'
  ]);
});

gulp.task('clean', function(cb){
  if ( !fs.existsSync(paths.build) ) {
    console.log("Error: jxcore build dir not found:", paths.build);
    return;
  }
  return del([
    paths.build
  ], {force: true}, cb);
});

// trim node_modules folder of unnecessary files
gulp.task('trim:node_modules', function () {
  var node_modules = paths.build+'node_modules/';
  if ( !fs.existsSync(node_modules) ) {
    console.log("Error: node_modules dir not found:", node_modules);
    return;
  }
  var removables = [
    node_modules+'**/component.json',
    node_modules+'**/bower.json',
    node_modules+'**/pouchdb/docs/**/*',
    node_modules+'**/test/*',
    node_modules+'**/tests/*',
    node_modules+'**/examples/*',
    node_modules+'**/*.gif',
    node_modules+'**/*.jpg',
    node_modules+'**/*.png',
    node_modules+'**/*.md',
    node_modules+'**/*.css',
    node_modules+'**/*.html'
  ];
  return del(removables, {
    force: true,
    // dryRun: true
  })
  .then( function(paths) {
    console.log('Files and folders that would be deleted:\n', paths.join('\n'));
  });
});

// archive jxcore build dir for distribution
gulp.task('package', function(cb){
  runSequence(
    'jx:package',
    'jx:clean',
    cb);
});

// run jx package
gulp.task('jx:package', function(cb){
  // check if 'node_modules' exists
  if ( !fs.existsSync(paths.build+'node_modules') ) {
    console.log("Error: 'node_modules' not found in build dir:", paths.build);
    console.log("Try 'gulp clean' and 'gulp build' first.");
    return;
  }
  // check if 'app.js' exists in jxcore build dir
  var appjs = paths.build+'app.js';
  if ( !fs.existsSync(appjs) ) {
    console.log("Error: 'app.js' not found in jxcore build dir:", appjs);
    return;
  }
  // -slim docs,examples,src,test,tests
  return exec('cd '+paths.build+' && \
      jx package app.js "thali" && \
      echo "var thali = require(\'./thali.jx\');" > app.js',
    {maxBuffer: 1024 * 5000},
    function (err, stdout, stderr) {
      //console.log(stdout);
      console.log(stderr);
      cb(err);
    });
});

// clean up after jx package
gulp.task('jx:clean', function(cb){
  var removables = [
    paths.build+'node_modules',
    paths.build+'public',
    paths.build+'routes',
    paths.build+'thali.jxp'
  ];
  var i = removables.length;
  while (i--) {
    if ( !fs.existsSync(removables[i]) ) {
      console.log("Error: removable dir not found:", removables[i]);
      return;
    }
  }
  return del(removables, {force: true}, cb);
});
