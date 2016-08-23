'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name UtilService
 */
angular.module('transmartBaseUi').factory('UtilService', function () {

    var service = {};

    /**
     * @memberof UtilService
     * @param {String} s - Check if a string is a valid URL
     * @returns {boolean}
     */
    service.isURL = function (s) {
        var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
        return regexp.test(s);
    }

    return service;

});

