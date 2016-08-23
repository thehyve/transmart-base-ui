'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc directive
 * @name cohortGrid
 */
angular.module('transmartBaseUi')
    .directive('cohortGrid', function () {
        return {
            restrict: 'E',
            templateUrl: 'app/components/cohort-grid/cohort-grid.tpl.html',
            scope: {
                cohort: '=',
                headers: '='
            },
            controller: ['$scope', '$timeout', 'CohortGridService', function ($scope, $timeout, CohortGridService) {

                var ctrl = this;

                ctrl.gridOptions = CohortGridService.options;
                ctrl.style_modifiers = {'height': CohortGridService.HEIGHT};

                $scope.$watchCollection('headers', function (newValue, oldValue) {
                    if (!_.isEqual(newValue, oldValue)) {
                        CohortGridService.updateCohortGridView($scope.cohort, newValue);
                    }
                });

                $scope.$watchCollection('cohort', function (newValue, oldValue) {
                    if (!_.isEqual(newValue, oldValue)) {
                        CohortGridService.updateCohortGridView(newValue, $scope.headers);
                    }
                });
            }],
            controllerAs : 'ctrl'
        };
    });
