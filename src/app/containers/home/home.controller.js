'use strict';

angular.module('transmartBaseUi')
    .controller('HomeCtrl', ['EndpointService', function (EndpointService) {
        var vm = this;

        vm.login = function () {
            EndpointService.login();
        };
    }]);
