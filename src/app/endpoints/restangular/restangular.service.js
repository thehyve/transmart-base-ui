'use strict';

/**
 * Resource factory
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name ResourceService
 */
angular.module('tmEndpoints')
    .factory('ResourceService', function (Restangular, ResourceInterceptors) {

        var service = {};

        /**
         * Create restangular instance based on given endpoint
         * @param endpoint {object}
         * @returns {Restangular}
         */
        service.createResourceServiceByEndpoint = function (endpoint) {
            return Restangular.withConfig(function (RestangularConfigurer) {

                var fnResponseInterceptor = ResourceInterceptors.customResponseInterceptor,
                    fnErrorInterceptor = ResourceInterceptors.customErrorInterceptor;
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
    });
