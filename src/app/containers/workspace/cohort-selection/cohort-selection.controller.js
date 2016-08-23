'use strict';

angular.module('transmartBaseUi')
    .controller('CohortSelectionCtrl',
        ['$scope', 'ChartService', 'AlertService', '$stateParams', '$log',
            '$state', 'StudyListService', 'GridsterService', '$uibModal',
            function ($scope, ChartService, AlertService, $stateParams, $log,
                      $state, StudyListService, GridsterService, $uibModal) {

                var vm = this;

                ChartService.restoreCrossfilter();
                // Initialize the chart service only if uninitialized
                if (!ChartService.cs.mainDimension) {
                    ChartService.reset();
                }

                // Alerts
                vm.close = AlertService.remove;
                vm.alerts = AlertService.get();

                // Gridster
                vm.gridsterOpts = GridsterService.options;

                // Charts
                vm.cs = ChartService.cs;
                vm.selectedSubjects = ChartService.cs.selectedSubjects;

                $scope.$watchCollection(function () {
                   return ChartService.cs.selectedSubjects;
                }, function (newValue, oldValue) {
                    if (!_.isEqual(newValue, oldValue)) {
                        vm.selectedSubjects = newValue;
                    }
                });

                $scope.$watchCollection(function () {
                    return ChartService.cs.labels;
                }, function (newV, oldV) {
                    if (!_.isEqual(newV, oldV)) {
                        ChartService.updateDimensions();
                    }
                });

                // Tabs
                vm.tabs = [
                    {title: 'Cohort Selection', active: true},
                    {title: 'Cohort Grid', active: false}
                ];

                /**
                 * Activate tab
                 * @param tabTitle
                 * @param tabAction
                 */
                vm.activateTab = function (tabTitle, tabAction) {
                    vm.tabs.forEach(function (tab) {
                        tab.active = tab.title === tabTitle;
                    });
                    $state.go('workspace', {action: tabAction});
                };

                if ($stateParams !== undefined) {
                    if ($stateParams.action === 'cohortGrid') {
                        vm.activateTab(vm.tabs[1].title, 'cohortGrid');
                    } else {
                        vm.activateTab(vm.tabs[0].title, 'cohortSelection');
                    }
                }

                // Every selected concept is represented by a label
                vm.cohortChartContainerLabels = GridsterService.cohortChartContainerLabels;

                // Watch labels container
                $scope.$watchCollection(function () {
                    return GridsterService.cohortChartContainerLabels;
                }, function (newVal, oldVal) {
                    if (!_.isEqual(newVal, oldVal)) {
                        vm.cohortChartContainerLabels = newVal;
                    }
                });

                /**
                 * Update quantity of containers necessary for displaying the graphs in
                 * cohort selection.
                 * @param event Unused
                 * @param labels Corresponding to selected concepts
                 */
                $scope.$on('prepareChartContainers', function (event, labels) {
                    vm.cohortChartContainerLabels = GridsterService.resize('#main-chart-container', labels, false);
                });

                /**
                 * Removes a label and thus a concept form the selection
                 * @param label Corresponding to concept to be removed
                 */
                vm.removeLabel = function (label) {
                    ChartService.removeLabel(label);
                };

                /**
                 * Remove all the concepts from the cohort selection
                 */
                vm.resetActiveLabels = function () {
                    ChartService.reset();
                    ChartService.updateDimensions();
                };

                /**
                 * Callback for node drop
                 * @param event
                 * @param info
                 * @param node Dropped node from the study tree
                 */
                vm.onNodeDropEvent = function (event, info, node) {
                    ChartService.onNodeDrop(node);
                    angular.element(event.target).removeClass('chart-container-hover');
                };

                /**
                 * Add class when on node over the chart container
                 * @param e
                 */
                vm.onNodeOver = function (e) {
                    return angular.element(e.target).addClass('chart-container-hover');
                };

                /**
                 * Remove class when on node over the chart container
                 * @param e
                 */
                vm.onNodeOut = function (e) {
                    angular.element(e.target).removeClass('chart-container-hover');
                };

                /**
                 * Saves the cohort by asking for a name, saving it to the backend
                 * and showing the resulting id
                 */
                vm.openSaveCohortModal = function () {
                    $uibModal.open({
                        templateUrl: 'app/components/save-cohort/save-cohort-dialog.tpl.html',
                        controller: 'SaveCohortDialogCtrl as vm',
                        animation: false
                    });
                };

            }]);
