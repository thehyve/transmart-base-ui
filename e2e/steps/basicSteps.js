'use strict';

module.exports = function() {

    this.Then(/^I get sugestions on how to make this step$/, function (callback) {
         // Write code here that turns the phrase above into concrete actions
         browser.sleep(1000000);
         callback(null);
    });

    this.When(/^I run this step$/, function (callback) {
    browser.ignoreSynchronization = true;
    browser.get('/test/');
         // Write code here that turns the phrase above into concrete actions
         callback(null);
    });

};