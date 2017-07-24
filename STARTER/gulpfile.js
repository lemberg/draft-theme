"use strict";

/************************
 * SETUP
 ************************/
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const notify = require("gulp-notify");
const watch = require('gulp-watch');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
// SASS
const sass = require('gulp-sass');
const sassLint = require('gulp-sass-lint');
const cleanCss = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
// JS
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const jshint = require('gulp-jshint'); // doc - http://jshint.com/docs/options/
const jshintStylish = require('jshint-stylish');

/************************
 * CONFIGURATION
 ************************/

let paths = {
  bowerDir: './bower_components',
  npmDir: './node_modules',
};

let includePaths = [
  // Add paths to any sass @imports that you will use from bower_components here
  // Adding paths.bowerDir will allow you to target any bower package folder as an include path
  // for generically named assets
  paths.bowerDir + '/foundation-sites/scss',
];

let sassdocSrc = [
  './scss/**/*.scss',
];

let scriptsSrc = [
  './js/src/*.js'
];



/************************
 * TASKS
 ************************/

// SCSS tasks
gulp.task('scss-lint', () => {
  gulp.src('scss/**/*.s+(a|c)ss')
    .pipe(sassLint())
    .pipe(sassLint.format(notify()))
});
gulp.task('styles', () => {
  gulp.src(sassdocSrc)
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        includePaths: includePaths
      })
      // Catch any SCSS errors and prevent them from crashing gulp
      .on('error', function (error) {
        console.error('>>> ERROR', error);
        notify().write(error);
        this.emit('end');
      })
    )
    .pipe(autoprefixer(['last 2 versions', '> 1%', 'ie 11']))
    .pipe(sourcemaps.write())
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./css/'))
    .pipe(cleanCss({
      compatibility: 'ie11'
    }))
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(gulp.dest('./css/'))
});


// JS tasks
gulp.task('js-lint', () => {
  return gulp.src(scriptsSrc)
    .pipe(jshint())
    .pipe(jshint.reporter(jshintStylish))
    // Use gulp-notify as jshint reporter
    .pipe(notify(function (file) {
      if (file.jshint.success) {
        // Don't show something if success
        return false;
      }

      var errors = file.jshint.results.map(function (data) {
        if (data.error) {
          return "(" + data.error.line + ':' + data.error.character + ') ' + data.error.reason;
        }
      }).join("\n");
      return file.relative + " (" + file.jshint.results.length + " errors)\n" + errors;
    }));
});
gulp.task('scripts', () => {
  gulp.src(scriptsSrc)
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ["es2015", "es2016", "es2017"]
    }))
    .on('error', function(error) {
      console.log('>>> ERROR', error);
      notify().write(error);
      this.emit('end');
    })
    .pipe(concat('themekit.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./js/dist/'))
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('./js/dist/'))
});


// Watcher
gulp.task('watch', () => {
  watch(sassdocSrc, () => {
    gulp.start('scss-lint');
    gulp.start('styles');
  });

  watch(scriptsSrc, () => {
    gulp.start('js-lint');
    gulp.start('scripts');
  });
});

gulp.task('default', ['scss-lint', 'styles', 'js-lint', 'scripts']);
