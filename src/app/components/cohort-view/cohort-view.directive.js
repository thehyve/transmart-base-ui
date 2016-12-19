'use strict';

angular.module('transmartBaseUi')
    /**
     * Represents a list (ui-grid) to view and manage the saved cohorts.
     * @memberof transmartBaseUi
     * @ngdoc directive
     * @name cohortView
     */
    .directive('cohortView', function () {
        return {
            restrict: 'E',
            templateUrl: 'app/components/cohort-view/cohort-view.tpl.html',
            controller: 'CohortViewCtrl as ctrl',
            controllerAs: 'ctrl'
        };
    })

    /**
     * Controller for cohortView directive
     * @memberof transmartBaseUi
     * @ngdoc controller
     * @name cohortView
     */
    .controller('CohortViewCtrl', ['$scope', '$timeout', '$q', '$uibModal', 'CohortViewService',
            'AlertService', 'CohortSelectionService', 'QueryParserService', 'ContentService', '$state',
            function ($scope, $timeout, $q, $uibModal, CohortViewService, AlertService,
                      CohortSelectionService, QueryParserService, ContentService, $state) {

                $scope.cohorts = [];
                var ctrl = this;
                ctrl.gridOptions = CohortViewService.options;
                ctrl.gridApi = null;
                ctrl.isCohortSelected = false;

                // Function that updates the isCohortSelected flag
                var updateSelectionStatus = function () {
                    ctrl.isCohortSelected = ctrl.gridApi.selection.getSelectedCount() > 0;
                }

                // Update the selection when the data changes
                $scope.$watchCollection('cohorts', function (newValue, oldValue) {
                    if (!_.isEqual(newValue, oldValue)) {
                        updateSelectionStatus();
                    }
                });

                // Store a reference to the grid API when it becomes available
                ctrl.gridOptions.onRegisterApi = function (gridApi) {
                    ctrl.gridApi = gridApi;

                    // Listen for changes in the selection
                    gridApi.selection.on.rowSelectionChanged($scope, updateSelectionStatus);
                    gridApi.selection.on.rowSelectionChangedBatch($scope, updateSelectionStatus);
                };

                /**
                 * Loads the list of cohorts.
                 * @memberof CohortViewCtrl
                 */
                ctrl.loadCohortList = function () {
                    CohortViewService.getCohorts().then(function (cohorts) {
                        $scope.cohorts = cohorts;
                    }, function (error) {
                        AlertService.add('danger', 'Failed to retrieve list of cohorts');
                    });
                };

                /** Removes the specified cohort and renders a message on success/failure.
                 * @memberof CohortViewCtrl
                 * @param cohort the cohort to be removed
                 * @returns {*} a promise that is resolved when the removal is successful or
                 *              rejected when it is not.
                 */
                ctrl.removeCohort = function (cohort) {
                    var deferred = $q.defer();
                    CohortViewService.removeCohort(cohort).then(function () {
                        AlertService.add('success', 'Successfully removed cohort "' + cohort.name + '"');
                        deferred.resolve(cohort);
                    }, function (error) {
                        AlertService.add('danger', 'Failed to remove cohort "' + cohort.name + '"');
                        deferred.reject(error);
                    });
                    return deferred.promise;
                };

                /**
                 * Removes the cohorts currently selected in the cohort grid.
                 * @memberof CohortViewCtrl
                 */
                ctrl.removeSelectedCohorts = function () {
                    var selectedCohorts = ctrl.gridApi.selection.getSelectedRows();

                    // Remove all selected cohorts and reload the list after completing
                    $q.all(selectedCohorts.map(function (cohort) {
                        return ctrl.removeCohort(cohort);
                    })).then(function () {
                        ctrl.loadCohortList();
                    });
                };

                /**
                 * Loads the cohorts currently selected in the list.
                 */
                ctrl.loadSelectedCohorts = function () {
                    var selectedCohorts = ctrl.gridApi.selection.getSelectedRows();

                    var emptyBox = CohortSelectionService.findEmptyBox();
                    /*
                     * Condition 1. when there is an empty box, load the selected cohorts there
                     */
                    if (emptyBox) {
                        CohortSelectionService.loadCohorts(selectedCohorts, emptyBox);
                    }
                    /*
                     * Condition 2. when there is no empty box
                     */
                    else {
                        /*
                         * Condition 2.1. when a second empty box can be created
                         */
                        if (CohortSelectionService.boxes.length == 1) {
                            //create the second empty box, along with the corresponding workspace panel
                            var newEmptyBox = CohortSelectionService.addBox();
                            newEmptyBox.deferred.promise.then(function (success) {
                                CohortSelectionService.loadCohorts(selectedCohorts, newEmptyBox);
                            }, function (error) {
                                AlertService.add('danger', 'New workspace cannot be created. Error: ' + error);
                            });
                        }
                        /*
                         * Condition 2.2. when both boxes are occupied
                         */
                        else {
                            $uibModal.open({
                                templateUrl: 'app/components/load-cohort/load-cohort-dialog.tpl.html',
                                controller: 'LoadCohortDialogCtrl as vm',
                                animation: false,
                                resolve: {
                                    param: function () {
                                        return {
                                            selectedCohorts: selectedCohorts
                                        }
                                    }
                                }
                            });
                        }
                    }
                };

                // Initialize the list
                ctrl.loadCohortList();
            }
        ]
    );
