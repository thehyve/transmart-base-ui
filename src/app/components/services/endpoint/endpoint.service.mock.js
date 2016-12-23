'use strict';
/**
 * @Service EndpointServiceMocks
 * @Description Service layer exposing mocks for the EndpointService
 */
angular.module('transmartBaseUi')
	.factory('EndpointServiceMocks',
		function () {
			var mock = {};

            mock.getService = function() {
                var service = {
                    getEndpoints: function () {
                    },
                    clearStoredEndpoints: function () {
                    },
                    saveSelectedEndpoint: function () {
                    },
                    navigateToAuthorizationPage: function () {
                    },
                    removeEndpoint: function (e) {
                    },
                    authorizeEndpoint: function (endpoint) {
                    }
                };

                return service;
            };

            mock.getDummyEndpoints = function() {
                var dummy = [
                    {
                        title: 'foo',
                        url: ' http://foo',
                        status: 'active'
                    },
                    {
                        title: 'bar',
                        url: ' http://bar',
                        status: 'error'
                    },
                    {
                        title: ' local-dummy',
                        url: 'local-dummy',
                        status: 'local'
                    }
                ];

                return dummy;
            };


			return mock;
		});

