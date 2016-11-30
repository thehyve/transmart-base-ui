'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc controller
 * @name NavbarCtrl
 */
angular.module('transmartBaseUi')
    .controller('NavbarCtrl', ['$scope', '$state', 'EndpointService', '$interval',
        function ($scope, $state, EndpointService, $interval) {
            var vm = this;

            vm.showNavbar = true;

            vm.logout = function () {
                EndpointService.logout();
                $state.go('home');
            };

            var idleTimeLimit = 30; //in minutes
            $interval(function () {
                console.log('time is up');
                vm.logout();
            }, idleTimeLimit*60000);

            $scope.$watch(function () {
                return EndpointService.loggedIn;
            }, function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    vm.showNavbar = EndpointService.loggedIn;
                }
            });

        }]);
