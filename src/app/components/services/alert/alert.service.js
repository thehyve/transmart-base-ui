'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name AlertService
 */
angular.module('transmartBaseUi').factory('AlertService', ['$interval', function ($interval) {
    var service = {};
    var alerts = [];
    service.ids = 0;

    service.get = function () {
        return alerts;
    };

    service.add = function (type, message, delay) {
        var id = ++service.ids;

        // Display alert
        alerts.push({
            type: type,
            message: message,
            id: id
        });

        // If a delay is specified, a removal interval is registered
        if (delay) {
            $interval(function () {
                service.remove(id);
            }, delay, 1);
        }

    };

    service.remove = function (id) {
        var index = alerts.map(function (x) {
            return x.id;
        }).indexOf(id);
        if (index !== -1) {
            alerts.splice(index, 1);
        }
    };

    service.reset = function () {
        alerts = [];
    };

    return service;
}]);
