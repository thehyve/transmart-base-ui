'use strict';

/**
 * Custom Interceptors
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name ResourceInterceptors
 */
angular.module('tmEndpoints')
    .factory('ResourceService', ['AlertService', 'Restangular',
        function (AlertService, Restangular) {

            var service = {};

            /**
             * Create restangular instance based on given endpoint
             * @param endpoint {object}
             * @returns {Restangular}
             * @memberof EndpointService
             */
            service.createResourceServiceByEndpoint = function (endpoint) {
                return Restangular.withConfig(function (RestangularConfigurer) {

                    var fnResponseInterceptor = service.customResponseInterceptor,
                        fnErrorInterceptor = service.customErrorInterceptor;
                    var baseURL = endpoint.url + '/' + endpoint.apiVersion;
                    RestangularConfigurer.setBaseUrl(baseURL);
                    RestangularConfigurer.setDefaultHeaders(
                        {
                            'Authorization': 'Bearer ' + endpoint.access_token,
                            'Accept': 'application/hal+json'
                        }
                    );

                    // Set an interceptor in order to parse the API response
                    // when getting a list of resources
                    RestangularConfigurer.addResponseInterceptor(fnResponseInterceptor);
                    RestangularConfigurer.setErrorInterceptor(fnErrorInterceptor);

                    // Using self link for self reference resources
                    RestangularConfigurer.setRestangularFields({
                        selfLink: 'self.link'
                    });
                });
            };

            return service;
        }]);
