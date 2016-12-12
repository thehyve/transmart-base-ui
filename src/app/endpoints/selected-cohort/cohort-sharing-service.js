/**
 * Created by piotrzakrzewski on 26/09/2016.
 */
'use strict'
/**
 * Resource factory
 * @memberof tmEndpoints
 * @ngdoc factory
 * @name CohortSharingService
 */
angular.module('tmEndpoints')
    .factory('CohortSharingService', [function () {
        var service = {
        };

        var cohorts = [];

        service.getSelection = function () {
            return cohorts;
        };

        service.setSelection = function (cohortsArray) {
            cohorts = cohortsArray;
        };

        return service;
    }]);

