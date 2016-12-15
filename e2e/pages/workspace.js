'use strict';

/*
!!! pages do not hold state !!!
*/
var workspacePage = function() {
    // basic page information
    this.url = '/workspace'; // relative or full url. see protractor browser.get() documentation
    this.ignoreSync = false; // set to true is the page doesn't contain angular
    this.at = function(){
        return browser.getCurrentUrl().then(function(actualUrl) {
                                            return browser.baseUrl + '/workspace' == actualUrl;
                                          });
    };
};

module.exports = new workspacePage();
