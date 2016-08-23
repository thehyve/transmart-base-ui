'use strict';

angular.module('transmartBaseUi')
    .controller('ConnectionsCtrl', ['$location', 'EndpointService', 'StudyListService', 'AlertService',
        function ($location, EndpointService, StudyListService, AlertService) {

            var vm = this;

            // alerts
            vm.close = AlertService.remove;
            vm.alerts = AlertService.get();

            // form data obj
            vm.formData = {};

            // get list of stored endpoints (if any)
            vm.endpoints = EndpointService.getEndpoints();

            // Predefined endpoints
            vm.connections = [
                {
                    title: 'transmart-gb',
                    url: 'http://transmart-gb.thehyve.net/transmart',
                    isOAuth: true
                },
                {
                    title: 'transmart-test-translocation',
                    url: 'http://transmart-test-translocation.thehyve.net/transmart',
                    isOAuth: true
                }
            ];

            vm.selectedConnection = {};

            /**
             * Empty endpoints
             */
            vm.clearSavedEndpoints = function () {
                EndpointService.clearStoredEndpoints();
                vm.endpoints = EndpointService.getEndpoints();
            };

            /**
             * Navigate to authorization page
             */
            vm.navigateToAuthorizationPage = function () {
                // check selected connection
                var isSelected = _.filter(EndpointService.getEndpoints(), {url: vm.selectedConnection.url});

                if (isSelected.length > 0) {
                    AlertService.add('warning', 'You are already connected to ' + vm.selectedConnection.url);
                    return false;
                }

                EndpointService.authorizeEndpoint(vm.selectedConnection);
            };

            /**
             * Populate selected endpoint
             */
            vm.populateDefaultApi = function () {
                vm.formData.title = vm.selectedConnection.label;
                vm.formData.url = vm.selectedConnection.url;
                vm.formData.requestToken = '';
            };

            /**
             * Remove an endpoint
             * @param endpoint
             */
            vm.removeEndpoint = function (endpoint) {
                EndpointService.removeEndpoint(endpoint);

                // delete study that has associated endpoint
                StudyListService.removeStudiesByEndpoint(endpoint);
            };

            /**
             * Get status icon
             * @param endpoint
             * @returns {string}
             */
            vm.getStatusIcon = function (endpoint) {
                var glyphicon = 'glyphicon glyphicon-ban-circle';
                if (endpoint.status === 'active') {
                    glyphicon = 'glyphicon-ok text-success';
                } else if (endpoint.status === 'error') {
                    glyphicon = 'glyphicon-warning-sign text-warning';
                } else if (endpoint.status === 'local') {
                    glyphicon = 'glyphicon glyphicon-hdd text-success';
                }
                return glyphicon;
            };

        }]);
