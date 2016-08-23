'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc controller
 * @name SaveCohortDialogCtrl
 */
angular.module('transmartBaseUi')
    .controller('SaveCohortDialogCtrl', ['$scope', '$uibModalInstance', 'EndpointService', 'ChartService', 'QueryBuilderService', 'AlertService',
        function ($scope, $uibModalInstance, EndpointService, ChartService, QueryBuilderService, AlertService) {

            var vm = this;

            vm.cohortName = '';

            /**
             * Saves the currently selected cohort to the backend.
             * @memberof SaveCohortDialogCtrl
             */
            vm.ok = function () {
                var endpoint = EndpointService.getMasterEndpoint();
                var i2b2Query = QueryBuilderService.convertCohortFiltersToXML(
                    ChartService.getCohortFilters(), $scope.cohortName);

                var patientSets = endpoint.restangular.all('patient_sets');
                patientSets.customPOST(i2b2Query, undefined, undefined,
                    {'Content-Type': 'text/xml'})
                    .then(function (result) {
                        AlertService.add('success', 'Cohort saved OK: "' + $scope.cohortName +
                            '", id: ' + result.id + ', size: ' + result.setSize);
                    }, function (result) {
                        AlertService.add('danger', 'There was an error saving cohort "' +
                            $scope.cohortName + '": ' + result.data.message);
                    });

                $uibModalInstance.close();
            };

            vm.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };

        }]);
