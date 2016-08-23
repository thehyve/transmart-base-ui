'use strict';

var gulp = require('gulp');
var shell = require('gulp-shell');

gulp.task('docs', shell.task([
    'node_modules/jsdoc/jsdoc.js ' +
    '-c node_modules/angular-jsdoc/common/conf.json ' +   // config file
    '-t node_modules/angular-jsdoc/angular-template ' +   // template file
    '-d dist/docs ' +                          // output directory
    './README.md ' +                          // to include README.md as index contents
    '-r src/app/ '                 // source code directory
]));
