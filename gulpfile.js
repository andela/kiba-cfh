const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const browserSync = require('browser-sync');
const bower = require('gulp-bower');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const sass = require('gulp-sass');
const coveralls = require('gulp-coveralls');
const cover = require('gulp-coverage');
const istanbul = require('gulp-istanbul');
const plumber = require('gulp-plumber');
const jasmine = require('gulp-jasmine');

gulp.task('watch', () => {
  gulp.watch('app/views/**', browserSync.reload());
  gulp.watch('public/views/**', browserSync.reload());
  gulp.watch('public/css/common.scss', ['sass']);
  gulp.watch('public/css/**', browserSync.reload());
  gulp.watch('public/js/**', browserSync.reload());
  gulp.watch('app/**/*js', browserSync.reload());
});

gulp.task('sass', () => {
  gulp
    .src('public/css/common/scss')
    .pipe(sass())
    .pipe(gulp.dest('public/css/'));
});

gulp.task('nodemon', () => {
  nodemon({
    script: 'server.js',
    ext: 'js',
    ignore: ['README.md', 'node_modules/**', '.DS_Store'],
    watch: ['app', 'config'],
    env: {
      PORT: 3000
    }
  });
});
gulp.task('angular', () => {
  gulp
    .src('bower_components/angular/**/*.js')
    .pipe(gulp.dest('public/lib/angular'));
});
gulp.task('bootstrap', () => {
  gulp
    .src('bower_components/bootstrap/**/*')
    .pipe(gulp.dest('public/lib/bootstrap'));
});
gulp.task('jquery', () => {
  gulp.src('bower_components/jquery/**/*').pipe(gulp.dest('public/lib/jquery'));
});
gulp.task('underscore', () => {
  gulp
    .src('bower_components/underscore/**/*')
    .pipe(gulp.dest('public/lib/underscore'));
});
gulp.task('angularUtils', () => {
  gulp
    .src('bower_components/angular-ui-utils/modules/route/route.js')
    .pipe(gulp.dest('public/lib/angular-ui-utils/modules'));
});
gulp.task('angular-bootstrap', () => {
  gulp
    .src('bower_components/angular-bootstrap/**/*')
    .pipe(gulp.dest('public/lib/angular-bootstrap'));
});
gulp.task('lint', () => {
  gulp
    .src([
      'public/js/**/*.js',
      'app/**/*.js',
      'config/**/*.js',
      '!node_modules',
      '!test/**/*.js'
    ])
    .pipe(eslint());
});

gulp.task('bower', () => {
  bower().pipe(gulp.dest('./bower_components'));
});

gulp.task('test', ['mochaTest']);
gulp.task('install', ['bower']);
gulp.task('default', [
  'nodemon',
  'watch',
  'sass',
  'angular',
  'underscore',
  'bootstrap',
  'angular-bootstrap',
  'angularUtils',
  'jquery'
]);

gulp.task('coveralls', () => {
  if (!process.env.CI) return;
  return gulp.src('./coverage/lcov.info').pipe(coveralls());
});

gulp.task('mochaTest', () => {
  gulp
    .src('test/**/*.js')
    .pipe(istanbul({ includeUntested: true }))
    .pipe(istanbul.hookRequire())
    .on('finish', () => {
      gulp
        .src('test/**/*.js', { read: false })
        .pipe(plumber())
        .pipe(
          mocha({
            reporter: 'spec',
            timeout: 20000
          })
        )
        .pipe(
          cover.instrument({
            pattern: ['test/**/*.js']
          })
        )
        .pipe(jasmine())
        .pipe(cover.gather())
        .pipe(cover.format({ reporter: 'lcov' }))
        .pipe(istanbul.writeReports());
    });
});
