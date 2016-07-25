'use strict';

angular.module('transmartBaseUi')
    .factory('ResourceInterceptors', function () {

        var service = {};

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
                } else if (what === 'studies') {
                    // nothing
                } else {
                    _what = _getLastToken(what);
                    resp = data._embedded[_what];
                }
                return resp;
            }
            return data;
        };

        return service;
    });
