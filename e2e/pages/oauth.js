'use strict';

/*
!!! pages do not hold state !!!
*/
var oauthPage = function() {
    // basic page information
    this.url = ''; // relative or full url. see protractor browser.get() documentation
    this.ignoreSync = true; // set to true is the page doesn't contain angular
    this.at = function() {
        return this.authorizeButton.isDisplayed();
    }

    // page specific element identifiers.
    this.authorizeButton = element(by.name('authorize'));
    this.denyButton = element(by.name('deny'));
};

module.exports = new oauthPage();
