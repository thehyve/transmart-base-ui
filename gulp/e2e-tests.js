'use strict';

var path = require('path');
var gulp = require('gulp');
var shell = require('gulp-shell')
var conf = require('./conf');

var browserSync = require('browser-sync');

var $ = require('gulp-load-plugins')();

// Downloads the selenium webdriver
gulp.task('webdriver-update', $.protractor.webdriver_update);
gulp.task('webdriver-standalone', $.protractor.webdriver_standalone);

gulp.task('docker-start', shell.task(['docker run -d -P -e no_proxy=localhost -e HUB_ENV_no_proxy=localhost -p 0.0.0.0:4444:4444 -p 0.0.0.0:5900:5900 --name gulp-chrome-debug selenium/standalone-chrome-debug']))
gulp.task('docker-stop', shell.task(['docker stop gulp-chrome-debug', 'docker rm gulp-chrome-debug']))

function runProtractor(done) {
    var args = process.argv.slice(3);

    gulp.src(conf.paths.e2e)
        .pipe($.protractor.protractor({
            configFile: 'protractor.conf.js',
            args: args
        }))
        .on('error', function (err) {
            // Make sure failed tests cause gulp to exit non-zero
            throw err;
        })
        .on('end', function () {
            // Close browser sync server
            browserSync.exit();
            done();
        });
}

gulp.task('protractor:verify', runProtractor)
gulp.task('protractor', ['protractor:src']);
gulp.task('protractor:src', ['serve:e2e', 'webdriver-update'], runProtractor);
gulp.task('protractor:dist', ['serve:e2e-dist', 'webdriver-update'], runProtractor);
