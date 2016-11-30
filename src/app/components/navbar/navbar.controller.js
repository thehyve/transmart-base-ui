'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc controller
 * @name NavbarCtrl
 */
angular.module('transmartBaseUi')
    .controller('NavbarCtrl', ['$scope', '$state', 'EndpointService',
        function ($scope, $state, EndpointService) {
            var vm = this;

            vm.showNavbar = true;

            vm.logout = function () {
                EndpointService.logout();
                $state.go('home');
            };

            $scope.$watch(function () {
                return EndpointService.loggedIn;
            }, function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    vm.showNavbar = EndpointService.loggedIn;
                }
            });

        }]);
