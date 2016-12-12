'use strict';

var paths = require('./.yo-rc.json')['generator-gulp-angular'].props.paths;

// An example configuration file.
exports.config = {
    // The address of a running selenium server.
//    seleniumAddress: 'http://localhost:4444/wd/hub',
    //seleniumServerJar: deprecated, this should be set on node_modules/protractor/config.json

    // Capabilities to be passed to the webdriver instance.
    capabilities: {
        'browserName': 'chrome'
    },

    // set to "custom" instead of cucumber.
    framework: 'custom',

    // path relative to the current config file
    frameworkPath: require.resolve('protractor-cucumber-framework'),

//    baseUrl: 'http://localhost:3000',

    // Spec patterns are relative to the current working directory when
    // protractor is called.
    specs: [paths.e2e + '/features/**/*.feature'],

    cucumberOpts: {
        require: paths.e2e + '/steps/**/*.js'
    },

//    // Options to be passed to Jasmine-node.
//    jasmineNodeOpts: {
//        showColors: true,
//        defaultTimeoutInterval: 30000
//    }
};
