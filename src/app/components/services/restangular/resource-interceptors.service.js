'use strict';

/**
 * Custom Interceptors
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name ResourceInterceptors
 */
angular.module('transmartBaseUi')
    .factory('ResourceInterceptors', ['AlertService', function (AlertService) {

        var service = {};

        /**
         * Intercept response to change 'concepts' to 'ontology_terms'
         * @memberof ResourceInterceptors
         * @param data {object} - The data received got from the server
         * @param operation {string} - The operation made. It'll be the HTTP method used except for a GET which
         * returns a list of element which will return getList so that you can distinguish them.
         * @param what {string} - The model that's being requested.
         * @returns {object} data
         */
        service.customResponseInterceptor = function (data, operation, what) {

            var _getLastToken = function (what) {
                var _t = what.split('/').slice(1);
                return what.indexOf('/') === -1 ? what : _t[_t.length - 1];
            };

            if (operation === 'getList') {
                var _what, resp = data;
                if (what === 'concepts') {
                    what = 'ontology_terms';
                    resp = data._embedded[what];
                } else {
                    _what = _getLastToken(what);
                    resp = data._embedded[_what];
                }
                return resp;
            }

            return data;
        };

        /**
         * Handle common HTTP Errors
         * @param response
         * @returns {boolean} - true if error not handled, false if it is
         */
        service.customErrorInterceptor = function(response) {

            if (response.status === 401) {
                AlertService.add('danger', 'HTTP ' + response.status
                    + ': Unauthorized request.');
            }

            if (response.status === 404) {
                AlertService.add('danger', 'HTTP ' + response.status
                    + ': The resource that you are trying to access was moved or does not exist.');
            }

            if (response.status === 403) {
                AlertService.add('danger', 'HTTP ' + response.status
                    + ': Forbidden request.');
            }

            if (response.status === 500) {
                AlertService.add('danger', 'HTTP ' + response.status
                    + ': Internal server error.');
            }

            return true; // error not handled
        };

        return service;
    }]);
