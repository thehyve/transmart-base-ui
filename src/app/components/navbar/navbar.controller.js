'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc controller
 * @name NavbarCtrl
 */
angular.module('transmartBaseUi')
    .controller('NavbarCtrl', ['$scope', '$state', '$uibModal', 'EndpointService',
        function ($scope, $state, $uibModal, EndpointService) {
            var vm = this;

            vm.showNavbar = true;
            vm.warningDialog = null;

            vm.logout = function () {
                EndpointService.logout();
                $state.go('home');
            };

            $scope.$on('IdleStart', function () {
                vm.warningDialog = $uibModal.open({
                    templateUrl: 'app/components/navbar/warning-dialog.html',
                    windowClass: 'modal-danger'
                });
            });

            $scope.$on('IdleTimeout', function () {
                vm.warningDialog.close();
                vm.logout();
            });

            $scope.$watch(function () {
                return EndpointService.loggedIn;
            }, function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    vm.showNavbar = EndpointService.loggedIn;
                }
            });

        }])
    .config(function (IdleProvider, KeepaliveProvider) {
        IdleProvider.idle(20*60); // 20min in seconds
        IdleProvider.timeout(10); // in seconds
        KeepaliveProvider.interval(20); // in seconds
    })
    .run(function (Idle) {
        // start watching when the app runs,
        // also starts the Keepalive service by default.
        Idle.watch();
    });
