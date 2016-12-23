'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc directive
 * @name tsCohortChart
 * @description handles cohort chart creation and user-interaction
 */
angular.module('transmartBaseUi')
    .directive('tsCohortChart', ['DcChartsService', 'CohortSelectionService', 'CohortExportService', 'AlertService',
        function (DcChartsService, CohortSelectionService, CohortExportService, AlertService) {

            var _scope = {
                tsGridster: '=',
                tsGridsterItem: '=',
                tsLabel: '='
            };

            return {
                restrict: 'E',
                templateUrl: 'app/components/cohort-chart/cohort-chart.tpl.html',
                scope: _scope,
                link: function (scope, el) { // -- begin of the link function --
                    var cohortSelectionCtrl = CohortSelectionService.getBox(scope.tsLabel.boxId).ctrl;

                    var _chart,
                        _bodyDiv = el.find('div')[2];

                    _chart = cohortSelectionCtrl.createCohortChart(scope.tsLabel, _bodyDiv);
                    /*
                     * this listener function will be invoked after a filter is applied, added or removed.
                     * filtered.monitor is the event emitted during filtering
                     */
                    _chart.on('filtered', function () {
                        //keep the tsLabel.filters to be in sync with chart.filters()
                        var filters = _chart.filters();
                        _chart.tsLabel.filters = filters;
                        cohortSelectionCtrl.updateDimensions();

                        //update the min and max values if it is a bar chart
                        if (filters.length > 0 && scope.isBarChart) {
                            scope.filterOpt.min = _.floor(filters[0][0], 3);
                            scope.filterOpt.max = _.floor(filters[0][1], 3);
                        }
                    });

                    /*
                     * this listener function will be invoked after transitions after redraw and render.
                     */
                    _chart.on('renderlet', function () {
                        if (_chart.type === 'PIECHART') {
                            DcChartsService.emphasizeChartLegend(_chart);
                        }
                    });

                    scope.chart = _chart;

                    // check if chart is number chart or not
                    scope.isNumberChart = _chart.type === 'NUMBER';
                    // check if chart is bar chart or not
                    scope.isBarChart = _chart.type === 'BARCHART';
                    // show group icon
                    scope.showGroupIcon = scope.tsLabel.type !== 'combination' && scope.tsLabel.type !== 'highdim';

                    scope.filterOpt = {
                        // the flag indicating whether to show the manual filter input option
                        showFilterInput: false,
                        min: null,
                        max: null
                    };

                    // resize chart when container is being resized
                    scope.$watchGroup([
                        'tsGridsterItem.sizeX', 'tsGridsterItem.sizeY',
                        'tsGridster.curColWidth', 'tsGridster.curRowHeight'
                    ], function (newValues, oldValues, scope) {
                        // save gridster info
                        _chart.gridInfo = {
                            sizeX: newValues[0],
                            sizeY: newValues[1],
                            curColWidth: newValues[2],
                            curRowHeight: newValues[3]
                        };

                        if (!_.isEqual(newValues, oldValues)) {
                            var _node = CohortSelectionService.findNodeByConceptPath
                            (_chart.tsLabel.conceptPath, cohortSelectionCtrl.cs.nodes);
                            if (_node) {
                                _node.label.sizeX = _chart.gridInfo.sizeX;
                                _node.label.sizeY = _chart.gridInfo.sizeY;
                                _node.label.curColWidth = _chart.gridInfo.curColWidth;
                                _node.label.curRowHeight = _chart.gridInfo.curRowHeight;
                            }
                        }
                        // Number of characters after which the title string will be cut off
                        // 10 pixels per characters is assumed
                        scope.cutOff = _chart.gridInfo.sizeX * (_chart.gridInfo.curColWidth - 30) / 10;
                        DcChartsService.resizeChart(_chart);
                    });

                    // Title for the chart panel
                    scope.title = scope.tsLabel.name + ' - ' + scope.tsLabel.study._embedded.ontologyTerm.name;

                    /**
                     * Group charts
                     * @memberof tsCohortChart
                     */
                    scope.groupAction = function () {
                        scope.groupOn = true;
                        cohortSelectionCtrl.groupCharts(_chart, function () {
                            scope.groupOn = false;
                        });
                    };

                    scope.removeChart = function (label) {
                        cohortSelectionCtrl.removeLabel(label);
                    };

                    scope.clearFilter = function (label) {
                        scope.filterOpt.min = null;
                        scope.filterOpt.max = null;
                        return cohortSelectionCtrl.clearChartFilterByLabel(label);
                    };

                    scope.toggleFilterInput = function () {
                        if (scope.isBarChart) {
                            scope.filterOpt.showFilterInput = !scope.filterOpt.showFilterInput;
                        }
                    };

                    scope.filterBarChart = function () {

                        var min = +scope.filterOpt.min,
                            max = +scope.filterOpt.max;

                        if (scope.filterOpt.min === null || scope.filterOpt.min === '') {
                            min = null;
                        }
                        if (scope.filterOpt.max === null || scope.filterOpt.max === '') {
                            max = null;
                        }

                        if (_.isNaN(min) || _.isNaN(max) || (min === null && max === null)) {
                            //toastr.error('Please specify numeric values for the filter input.');
                            AlertService.add('danger', 'Please specify numeric values for the filter input.');
                        }
                        else {
                            var mmin = +scope.chart.xAxisMin();
                            var mmax = +scope.chart.xAxisMax();
                            var adjusted = false;

                            if (min === null || min < mmin) {
                                min = mmin;
                                adjusted = true;
                            }

                            if (max === null || max > mmax) {
                                max = mmax;
                                adjusted = true;
                            }

                            if (max > min) {
                                var range = dc.filters.RangedFilter(min, max);
                                scope.chart.filter(null);
                                scope.chart.filter(range);
                                scope.chart.redraw();
                            }
                            else if (adjusted) {
                                AlertService.add('danger', 'Selection out of bound.');
                            }
                            else if (max <= min) {
                                AlertService.add('danger', 'Max should be larger than min.');
                            }

                        }
                    };

                    scope.exportImage = function (label, imgType) {
                        switch (imgType) {
                            case 'png':
                                CohortExportService.exportChartPNG(label);
                                break;
                            case 'pdf':
                                CohortExportService.exportChartPDF(label);
                                break;
                            case 'svg':
                                CohortExportService.exportChartSVG(label);
                                break;
                            default:
                                CohortExportService.exportChartPNG(label);
                                break;

                        }
                    }
                }// -- end of the link function --
            };
        }]);
