'use strict';
var actor = require('protractor-cucumber-pages').core
actor.setSearchDir(__dirname + '/..')

module.exports = function() {
    this.setDefaultTimeout(60 * 1000); //max time before callback

    //this should probably be replaced by doing a rest call and setting a coocky
    this.When(/^I login with (.*)$/, function (userName, callback) {
         var user = actor.getUser(userName);
         Promise.all([
            actor.page.setUsername(user.username),
            actor.page.setPassword(user.password)
         ]).then(actor.page.login().then(callback, callback), callback);
    });

    this.When(/^authorize glowingbear\-js$/, function (callback) {
        actor.waitForPage('oauth').then(
        actor.page.authorizeButton.click().then(
        callback, callback), callback)
    });
};
