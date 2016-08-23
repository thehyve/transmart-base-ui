[![Build Status](https://travis-ci.org/thehyve/transmart-base-ui.svg)](https://travis-ci.org/thehyve/transmart-base-ui)
[![codecov.io](https://codecov.io/gh/thehyve/transmart-base-ui/branch/dev/graphs/badge.svg)](https://codecov.io/gh/thehyve/transmart-base-ui/branch/dev)

# transmart-base-ui
Boilerplate code for tranSMART UI

## Demo
http://transmart-gb.thehyve.net

## Pre-requisites
Make sure you have npm installed
https://docs.npmjs.com/getting-started/installing-node

## Usage
Run following from the project root

- Install tools
```
$ npm install 
```
- Install libs
```
$ bower install 
```
- Launch browser
```
$ gulp serve
```

### Use More Gulp tasks

* `gulp` or `gulp build` to build an optimized version of your application in `/dist`
* `gulp serve` to launch a browser sync server on your source files
* `gulp serve:dist` to launch a server on your optimized application
* `gulp test` to launch your unit tests with Karma
* `gulp test:auto` to launch your unit tests with Karma in watch mode
* `gulp protractor` to launch your e2e tests with Protractor
* `gulp protractor:dist` to launch your e2e tests with Protractor on the dist files

More information on the gulp tasks in [this README.md](app/templates/gulp/README.md).

### Configuration for development, testing and production

There are different configurations available for development, testing and production:
'dev', 'test' and 'prod'. Specify your environment by passing a parameter to gulp
('dev' is the default):
* 'gulp --env dev serve'
* 'gulp --env test test'
* 'gulp --env prod build'

## Directory structure

[Best Practice Recommendations for Angular App Structure](https://docs.google.com/document/d/1XXMvReO8-Awi1EZXAXS4PzDzdNvV6pGcuaF4Q9821Es/pub)

The root directory generated for a app with name `gulpAngular` :
<pre>
├──  src/
│   ├──  app/
│   │   ├──  main/
│   │   │   ├──  main.controller.js
│   │   │   ├──  main.controller.spec.js
│   │   │   └──  main.html
│   │   └──  index.js
│   │   └──  index.(css|less|scss)
│   │   └──  vendor.(css|less|scss)
│   ├──  assets/
│   │   └──  images/
│   ├──  components/
│   │   └──  navbar/
│   │   │   ├──  navbar.controller.js
│   │   │   └──  navbar.html
│   ├──  404.html
│   ├──  favico.ico
│   └──  index.html
├──  gulp/
├──  e2e/
├──  bower_components/
├──  nodes_modules/
├──  .bowerrc
├──  .editorconfig
├──  .gitignore
├──  .jshintrc
├──  bower.json
├──  gulpfile.js
├──  karma.conf.js
├──  package.json
├──  protractor.conf.js
</pre>

## Features included in the gulpfile
* *useref* : allow configuration of your files in comments of your HTML file
* *ngAnnotate* : convert simple injection to complete syntax to be minification proof
* *uglify* : optimize all your JavaScript
* *csso* : optimize all your CSS
* *rev* : add a hash in the file names to prevent browser cache problems
* *watch* : watch your source files and recompile them automatically
* *jshint* : JavaScript code linter
* *imagemin* : all your images will be optimized at build
* *Unit test (karma)* : out of the box unit test configuration with karma
* *e2e test (protractor)* : out of the box e2e test configuration with protractor
* *browser sync* : full-featured development web server with livereload and devices sync
* *angular-templatecache* : all HTML partials will be converted to JS to be bundled in the application
* **TODO** lazy : don't process files which haven't changed when possible

## Server Config

Angular html5mode is enabled to remove hashtag in the typical AngularJS
application. For that reason server side rewrites is needed. Following 
is Apache Rewrites:

```
<VirtualHost *:80>
    ServerName my-app

    DocumentRoot /path/to/app

    <Directory /path/to/app>
        RewriteEngine on

        # Don't rewrite files or directories
        RewriteCond %{REQUEST_FILENAME} -f [OR]
        RewriteCond %{REQUEST_FILENAME} -d
        RewriteRule ^ - [L]

        # Rewrite everything else to index.html to allow html5 state links
        RewriteRule ^ index.html [L]
    </Directory>
</VirtualHost>
```

If you deploy it to another application server find the configuration 
here:

https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions#how-to-configure-your-server-to-work-with-html5mode
