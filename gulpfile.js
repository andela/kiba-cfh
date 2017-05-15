const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const browserSync = require('browser-sync');
const bower = require('gulp-bower');
const eslint = require('gulp-eslint');
const jasmine = require('gulp-jasmine');
const sass = require('gulp-sass');

gulp.task('watch', () => {
  gulp.watch('app/views/**', browserSync.reload());
  gulp.watch('public/views/**', browserSync.reload());
  gulp.watch('public/css/common.scss', ['sass']);
  gulp.watch('public/css/**', browserSync.reload());
  gulp.watch('public/js/**', browserSync.reload());
  gulp.watch('app/**/*js', browserSync.reload());
});

gulp.task('sass', () => {
  gulp.src('public/css/common/scss')
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
      PORT: 3000,
    }
  });
});
gulp.task('lint', () => {
  gulp.src(['public/js/**/*.js',
    'app/**/*.js',
    'config/**/*.js',
    '!node_modules',
    '!test/**/*.js'])
    .pipe(eslint());
});

gulp.task('bower', () => {
  bower().pipe(gulp.dest('./public/lib'));
});

gulp.task('jasmineTest', () => {
  gulp.src(['test/**/*.js'])
    .pipe(jasmine({
      reporter: 'spec',
    }));
});

gulp.task('test', ['jasmineTest']);
gulp.task('install', ['bower']);
gulp.task('default', ['nodemon', 'watch', 'sass']);
