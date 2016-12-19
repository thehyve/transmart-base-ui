'use strict';
/**
 * @Service AlertServiceMocks
 * @Description Service layer exposing mocks for the AlertService
 */
angular.module('transmartBaseUi')
	.factory('AlertServiceMocks',
		function () {
			var mock = {};

            mock.getService = function() {
                var service = {
                    remove: function () {

                    },
                    get: function () {

                    },
                    add: function () {

                    }
                };

                return service;
            };

			return mock;
		});

