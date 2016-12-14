'use strict';

module.exports = {
    page: null,
    setActivePageTo: function(pageName) {
        try {
            return this.page = require('../pages/'+ pageName)
        } catch (err) {
            this.fatalError('The page: ' + pageName + ' does not exist.\n error: ' + err);
        }
    },
    goToPage: function(pageName) {
        var page = this.setActivePageTo(pageName);
        browser.ignoreSynchronization = page.ignoreSync;
        return browser.get(page.url);
    },
    at: function(pageName){
        var page = this.setActivePageTo(pageName);
        return Promise.resolve(page.at()).then(function(v) {
             return new Promise(function(resolve, reject) {
                       if (v) {
                         resolve();
                       }
                       else {
                         reject(Error('not at page: ' + pageName));
                       }
                     })
         });
    },
    // should only be used if a page transition might take very long or spans several redirects.
    waitForPage: function(pageName) {
        var page = this.setActivePageTo(pageName);
        return browser.wait(function(){
             return browser.getCurrentUrl().then(function(url){
                 return (page.at());
             })
        }, 10 * 1000).then(function(){
        }, function(err){throw 'Page: ' + pageName + ' did not appear fast enough.\n error: ' + err;})
    },
    getUser: function(userName){
        var users = require('../data/users');
        return users[userName];
    },
    fatalError: function(message) {
        throw 'Fatal error: the specification is incorrectly expressed! ' + message;
    }
}
