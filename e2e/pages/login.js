'use strict';

/*
!!! pages do not hold state !!!
*/
var LoginPage = function() {
    // basic page information
    this.url = '/login'; // relative or full url. see protractor browser.get() documentation
    this.ignoreSync = true; // set to true is the page doesn't contain angular

    // page specific element identifiers.
    this.username = element(by.id('j_username'));
    this.password = element(by.id('j_password'));
    this.loginButton = element(by.id('loginButton'));

    // actions that can be preformed on the page.
    this.setUsername = function(username) {
        return setText(this.username, username);
    }

    this.setPassword = function(password) {
        return setText(this.password, password);
    }

    this.login = function() {
        return this.loginButton.click();
    }
};

// Utility function to set the text in a text field
function setText(element, text) {
    // Ctrl + a to select all and send the rest of the keys
    return element.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'), text);
}

module.exports = new LoginPage();
