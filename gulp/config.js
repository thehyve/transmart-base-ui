'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var ngConstant = require('gulp-ng-constant');
var rename = require('gulp-rename');
var gutil = require('gulp-util');

/* This task builds config.js from config.json. In the build and inject tasks,
 config.js will be ignored to keep it separate from the compiled app.js,
 so the configuration can easily be overridden when deployed.
 In index.html it is included separately.
 */
gulp.task('config', function () {
    var config = require(path.join('..', conf.paths.src, 'app', 'config.json'));
    var environment = gutil.env.env ? gutil.env.env : 'dev';
    return ngConstant({
        name: "transmartBaseUiConstants",
        constants: config[environment],
        deps: [],
        stream: true
    })
        .pipe(rename('config.js'))
        .pipe(gulp.dest(path.join(conf.paths.src, 'app')));
});

