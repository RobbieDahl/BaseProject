'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var sasslint = require('gulp-sass-lint');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var concatjs = require('gulp-concat');
var uglify = require('gulp-uglify');

var sourceFolders = {
    Bootstrap: './node_modules/bootstrap/'
    , Jquery: './node_modules/jquery/'
};
var distFolders = {
    Bootstrap: './Content/Bootstrap/'
    , JsLib: './Scripts/Lib/'
    , JsApp: './Scripts/App/'
    , JS: './Scripts/'
    , Css: './Content/'
    , Scss: './Content/SCSS/'
};
var sassOptions = {
    outputStyle: 'expanded'
};
var onError = function (err) {
    notify.onError({
        title: 'An Error Has Occurred',
        message: 'Error:; <%= error.message %>'
    })(err);
    this.emit('end');
};

//Copy Libraries to Dist folders
gulp.task('copy:Libraries', function () {
    gulp.src([sourceFolders.Bootstrap + 'dist/js/bootstrap.js'])
        .pipe(gulp.dest(distFolders.JsLib));
    gulp.src([sourceFolders.Bootstrap + 'scss/**/*'])
        .pipe(gulp.dest(distFolders.Bootstrap + 'SCSS'));
    gulp.src([sourceFolders.Jquery + 'dist/jquery.js'])
        .pipe(gulp.dest(distFolders.JsLib));
    gulp.src(['./node_modules/tether/dist/js/tether.js'])
        .pipe(gulp.dest(distFolders.JsLib));
    gulp.src(['./node_modules/spin/dist/spin.js'])
        .pipe(gulp.dest(distFolders.JsLib));
});

//Compile Bootstrap to CSS
gulp.task('scss:Bootstrap', function() {
    return gulp.src(distFolders.Bootstrap + 'SCSS/bootstrap.scss')
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions))
        .pipe(sourcemaps.write('../SourceMaps/'))
        .pipe(notify({
            title: 'SCSS: Compiled',
            message: 'Successfully compiled <%= file.relative %>!'
        }))
        .pipe(gulp.dest(distFolders.Bootstrap))
});

//Compile Site SASS
gulp.task('scss:Site', ['lint:SCSS'], function() {
    return gulp.src(distFolders.Scss + 'Site.scss')
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions))
        .pipe(sourcemaps.write('./SourceMaps/'))
        .pipe(notify({
            title: 'SCSS: Compiled',
            message: 'Successfully compiled <%= file.relative %>!',
            sound: 'Hero',
            onLast: true
        }))
        .pipe(gulp.dest(distFolders.Css))
});

//Lint SASS
gulp.task('lint:SCSS', function () {
    return gulp.src(distFolders.Scss + '*.scss')
        .pipe(sasslint({
            config: 'sass-lint.yml'
        }))
        .pipe(sasslint.format())
        .pipe(sasslint.failOnError());
});

//Bundle for just Ensemble Site
gulp.task('create:E4Css', ['lint:SCSS', 'scss:Site'], function () {
    return gulp.src([
          distFolders.BootStrap + 'bootstrap.css'
        , distFolders.Css + 'Ensemble4.css'
        , distFolders.Css + 'prettify.css'
        , distFolders.Css + 'Site.css'
    ])
    .pipe(concatCss('Site.css'))
    .pipe(filesize({
        enableGzip: true
    }))
    .pipe(purify(['./Views/**/*.cshtml']))
    //.pipe(gulp.dest(distFolders.Css))
    .pipe(cssnano())
    .pipe(rename({ suffix: '.min' }))
    .pipe(filesize({
        enableGzip: true
    }))
    .pipe(gulp.dest(distFolders.Css))
});

//Bundle JS
gulp.task('bundle:JS', function () {
    return gulp.src([
            distFolders.JsLib + 'jquery.js'
            , distFolders.JsLib + 'tether.js'
            , distFolders.JsLib + 'bootstrap.js'
        ])
        .pipe(concatjs('Site.js'))
        //.pipe(gulp.dest(distFolders.JS))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(distFolders.JS))
        .pipe(notify({
            title: 'JS Bundled',
            message: 'JS Successfully Bundled',
            sound: 'Hero',
            onLast: true
        }))
});

//WATCHERS -====================================================================================== WATCHERS
gulp.task('watch:SCSS', function() {
    gulp.watch(distFolders.Scss + '**/*.scss', ['scss:Site'])
});