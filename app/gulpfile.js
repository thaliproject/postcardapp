'use strict';

var path = require('path'),
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

// default paths (from script dir) for `gulp build`
var paths = {
  base: '.',
  src: '',
  build: '../www/jxcore/',
};

// The default task (called when you run `gulp`)
gulp.task('default', ['build']);

gulp.task('cordova:build', ['cordova:config','build'])

// Configure working paths (from root project dir) for `cordova build`
gulp.task('cordova:config', function(){
  paths = {
    base: 'app/',
    src: 'app/',
    build: 'www/jxcore/',
  };
  console.log("cwd:", process.cwd());
});

gulp.task('build', function(){
  console.log(process.cwd(), "paths src:", paths.src, "build:", paths.build);
  runSequence(
    'copy',
    'vulcanizer'
  );
});

gulp.task('copy', function(){
  return gulp.src([
      paths.src+'app.js',
      paths.src+'routes/*'
    ],{
      dot: true,
      base: paths.base
    })
    .pipe(gulp.dest(paths.build));
});

gulp.task('vulcanizer', function(){
  runSequence(
    'index:removeServerScripts',
    'index:mobile',
    'index:debug',
    'index:vulcanize'
    //'cleanWorkingFiles'
  );
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

gulp.task('clean', del.bind(null, ['.tmp', paths.build]));
