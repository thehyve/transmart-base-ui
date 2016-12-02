'use strict'

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name UtilityService
 * @description various utility functions
 */
angular.module('transmartBaseUi')
    .factory('UtilityService', [function () {

        var service = {};

        /**
         * Generate unique string
         * @returns {string} unique string
         * @memberof UtilityService
         */
        service.guid = function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        };

        /**
         * Check if a string exists in an array
         * @param str
         * @param arr
         * @returns {boolean}
         * @memberof UtilityService
         */
        service.contains = function (str, arr) {
            return arr.indexOf(str) === -1 ? false : true;
        }

        return service;
    }]);
