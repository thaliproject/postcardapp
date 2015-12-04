'use strict';

var path = require('path'),
    fs = require('fs'),
    gulp = require ('gulp'),
    dest = require('gulp-dest'),
    rename = require("gulp-rename"),
    runSequence = require('run-sequence'),
    replace = require('gulp-replace'),
    vulcanize = require('gulp-vulcanize'),
    crisper = require('gulp-crisper'),
    injectString = require('gulp-inject-string'),
    tap = require('gulp-tap'),
    del = require('del');

// default paths (from gulpfile.js dir) for `gulp build`
var paths = {
  base: '.',
  src: '',
  build: '../../www/jxcore/',
};

// The default task (called when you run `gulp`)
gulp.task('default', ['build']);

gulp.task('cordova:build', ['cordova:config','build'])

// Configure working paths (from root project dir) for `cordova build`
gulp.task('cordova:config', function(){
  paths = {
    base: 'app/jxcore/',
    src: 'app/jxcore/',
    build: 'www/jxcore/',
  };
  console.log("cwd:", process.cwd());
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
  console.log(process.cwd(), "paths src:", paths.src, "build:", paths.build);
  runSequence(
    'copy:node_modules',
    'copy:express',
    'index:removeServerScripts',
    'index:mobile',
    'index:debug',
    'index:vulcanize',
    //'cleanWorkingFiles',
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

// workaround for vulcanize server script error finding socket.io/socket.io.js
gulp.task('index:removeServerScripts', function(){
  var start_comment = "gulp:remove",
      end_comment = "gulp:endremove",
      pattern = new RegExp("(\\<!--\\s" + start_comment + "\\s--\\>)(.*\\n)*(\\<!--\\s" + end_comment + "\\s--\\>)", "g");
  return gulp.src(paths.src+'public/index.html')
    .pipe(require('gulp-tap')(function(file) {
      file.contents = new Buffer(String(file.contents).replace(pattern, ""));
    }))
    .pipe(rename({extname:'.html.tmp'}))
    .pipe(gulp.dest(paths.src+'public'));
});

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

gulp.task('cleanWorkingFiles', function(){
  return del([
    paths.src+'public/**/*.tmp'
  ]);
});

gulp.task('clean:jxcore', function(cb){
  return del([
    paths.build
  ], {force: true}, cb);
});
