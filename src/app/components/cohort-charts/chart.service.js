'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name ChartService
 * @description handles cohort chart creation and user-interaction
 */
angular.module('transmartBaseUi').factory('ChartService',
    ['$q', '$rootScope', '$timeout', 'AlertService', 'DcChartsService', 'GridsterService',
        function ($q, $rootScope, $timeout, AlertService, DcChartsService, GridsterService) {

            var chartService = {
                cs: {}
            };

            var _numDisplay = function (cDimension, cGroup, el) {
                var _number = dc.numberDisplay(el);
                _number.group(cGroup)
                    .html({
                        one: '%number',
                        some: '%number',
                        none: '%number'
                    })
                    .formatNumber(d3.format('f'));
                return _number;
            };

            /**
             * Get the last token when requested model is a string path
             * @memberof ChartService
             * @param {String} what
             * @returns {*}
             */
            var _getLastToken = function (what) {
                var _t = what.split('\\').slice(1);
                return what.indexOf('\\') === -1 ? what : _t[_t.length - 2];
            };

            var _groupCharts = function (chart1, chart2) {
                var _combinationLabel = {
                    labelId: chartService.cs.chartId++,
                    label: [chart1.tsLabel, chart2.tsLabel],
                    name: chart1.tsLabel.name + ' - ' + chart2.tsLabel.name,
                    resolved: false,
                    study: chart1.tsLabel.study,
                    type: 'combination'
                };
                chartService.cs.subjects.forEach(function (subject) {
                    if (subject.labels[chart1.tsLabel.labelId] || subject.labels[chart2.tsLabel.labelId]) {
                        subject.labels[_combinationLabel.labelId] = [subject.labels[chart1.tsLabel.labelId],
                            subject.labels[chart2.tsLabel.labelId]];
                    }
                });
                chartService.cs.labels.push(_combinationLabel);
                $rootScope.$broadcast('prepareChartContainers', chartService.cs.labels);
            };

            var _groupingChart = {};

            chartService.groupCharts = function (newChart, turnOff) {
                // If a first chart was already selected, group them together
                if (_groupingChart.chartOne) {
                    _groupCharts(newChart, _groupingChart.chartOne);
                    // Turn off both selection lights
                    _groupingChart.turnOff();
                    turnOff();
                    _groupingChart = {};
                    // If this is the first chart selected
                } else {
                    _groupingChart.chartOne = newChart;
                    _groupingChart.turnOff = turnOff;
                }
            };

            /**
             * Reset the cohort chart service to initial state
             * @memberof ChartService
             */
            chartService.reset = function () {
                this.cs.subjects = [];
                this.cs.selectedSubjects = [];
                this.cs.chartId = 0;
                this.cs.charts = [];
                this.cs.crossfilter = crossfilter();
                this.cs.dimensions = [];
                this.cs.maxNoOfDimensions = 20;
                this.cs.groups = [];
                this.cs.labels = [];
                this.cs.selected = 0;
                this.cs.total = 0;
                this.cs.mainDimension = this.cs.crossfilter.dimension(function (d) {
                    return d.labels;
                });

                $rootScope.$broadcast('prepareChartContainers', this.cs.labels);
            };

            /**
             * Restore the data of the crossfilter to full set
             * @memberOf ChartService
             */
            chartService.restoreCrossfilter = function () {
                if(this.cs.subjects && this.cs.subjects.length > 0) {
                    this.cs.crossfilter = crossfilter(this.cs.subjects);
                    return true;
                }
                else {
                    return false;
                }
            }

            var _getType = function (value) {
                var _type = typeof value;
                if (_type === 'string') {
                    if (value === 'E' || value === 'MRNA') {
                        _type = 'highdim';
                    }
                } else if (_type === 'number') {
                    if ((value % 1) !== 0) {
                        _type = 'float';
                    }
                }
                return _type;
            };

            /**
             * Add new label to list and check data type
             * @param obs
             * @param node
             * @param filterObj
             * @returns {int} labelId
             * @private
             */
            var _addLabel = function (obs, node, filterObj) {

                // Check if label has already been added
                var label = _.find(chartService.cs.labels, {label: obs.label});
                var filters;

                if (filterObj) {
                    filters = filterObj.filterWords;
                }

                if (!label) {

                    //Check that the maximum number of dimensions has not been reached
                    if (chartService.cs.labels.length < chartService.cs.maxNoOfDimensions) {
                        // Create the new label object

                        label = {
                            label: obs.label,
                            type: _getType(obs.value),
                            name: _getLastToken(obs.label),
                            labelId: chartService.cs.chartId++,
                            study: node.study,
                            resolved: false,
                            filters: filters
                        };
                        chartService.cs.labels.push(label);

                    } else {
                        AlertService.add('danger', 'Max number of dimensions reached !', 2000);
                    }
                } else {
                    // if label already exists check its type
                    label.type = label.type === 'float' ? label.type : _getType(obs.value);
                }

                if (label.type === 'float') {
                    var precision = (obs.value + '').split('.');
                    precision = precision[1] ? precision[1].length : 0;
                    label.precision = label.precision ? Math.min(label.precision, precision) : precision;
                }

                return label.labelId;
            };

            /**
             * Fetch the data for the selected node
             * @memberof ChartService
             * @param {Object} node
             * @param {Array} filters
             * @returns {*}
             */
            chartService.addNodeToActiveCohortSelection = function (node, filters) {
                var _filter, _deferred = $q.defer();

                var _getFilter = function (label, filters) {
                    return _.find(filters, {label: label});
                };

                // Get all observations under the selected concept
                node.restObj.one('observations').get().then(function (observations) {
                    observations = observations._embedded.observations;

                    observations.forEach(function (obs) {
                        if (obs.value !== null) {

                            if (filters) {
                                _filter = _getFilter(obs.label, filters);
                            }

                            // Add the concept to the list of chart labels
                            var _newLabelId = _addLabel(obs, node, _filter);

                            // Check if the subject of the observation is already present
                            var foundSubject = _.find(chartService.cs.subjects, {id: obs._embedded.subject.id});

                            if (foundSubject) {
                                foundSubject.labels[_newLabelId] = obs.value;
                            } else {
                                obs._embedded.subject.labels = {};
                                obs._embedded.subject.labels[_newLabelId] = obs.value;
                                chartService.cs.subjects.push(obs._embedded.subject);
                                chartService.cs.crossfilter.add([obs._embedded.subject]);
                            }
                        }
                    });

                    // Notify the applicable controller that the chart directive instances
                    // can be created
                    GridsterService.resize('#main-chart-container', chartService.cs.labels, false);
                    _deferred.resolve();
                }, function (err) {
                    _deferred.reject('Cannot get data from the end-point.' + err);
                });

                return _deferred.promise;
            };

            /**
             * Remove label from subjects and remove subjects no longer associated with any given label
             * @memberof ChartService
             * @param {Array} subjects
             * @param {String} label
             * @returns {*}
             */
            chartService.filterSubjectsByLabel = function (subjects, label) {
                subjects.forEach(function (subject, subjectIdx) {
                    subject.labels = _.filter(subject.labels, function (subjectLabel, subjectLabelIdx) {
                        return subjectLabelIdx !== label.labelId;
                    });
                    if (subject.labels.length < 1) {
                        subjects.splice(subjectIdx, 1);
                    }
                });
                return subjects;
            };

            /**
             * Remove a label from label collection
             * @memberof ChartService
             * @param {Array} labels
             * @param {Object} label
             * @returns {Array}
             */
            var _removeLabelFromLabels = function (labels, label) {
                return _.reject(labels, function (el) {
                    return el.labelId === label.labelId;
                });
            };

            /**
             * Remove a chart from chart collection
             * @memberof ChartService
             * @param {Array} charts
             * @param {Object} label
             * @returns {Array}
             */
            var _removeChartFromCharts = function (charts, label) {
                return _.filter(charts, function (chartToBeRemoved) {
                    if (chartToBeRemoved.id === label.labelId) {
                        chartToBeRemoved.filter(null); // clear filter
                    }
                    return chartToBeRemoved.id !== label.labelId;
                });
            };

            /**
             * Clear chart's filter
             * @memberof ChartService
             * @param {Object} label
             * @returns {Object} chart
             */
            chartService.clearChartFilterByLabel = function (label) {
                var chart;
                chart = _.find(this.cs.charts, {id: label.labelId});
                if (chart) {
                    chart.filter(null);
                    dc.redrawAll();
                    chartService.updateDimensions();
                }
                return chart;
            };

            /**
             * Remove label from cohort selection
             * @memberof ChartService
             * @param {Object} label
             */
            chartService.removeLabel = function (label) {
                if (label) {
                    // Remove associated chart from cs.charts
                    this.cs.charts = _removeChartFromCharts(this.cs.charts, label);

                    // Remove label from cs.labels
                    this.cs.labels = _removeLabelFromLabels(this.cs.labels, label);

                    // Remove label from cs.subjects and remove subjects no longer associated
                    // with any label
                    this.cs.subjects = chartService.filterSubjectsByLabel(this.cs.subjects, label);

                    // Remove dimension and group associated with the label
                    this.cs.dimensions.splice(label.labelId);
                    this.cs.groups.splice(label.labelId);

                    // Remove data in crossfilter if no more label is selected
                    if (this.cs.labels.length < 1) {
                        // Removes all records that match the current filter
                        this.cs.crossfilter.remove();
                    }

                    // Update charts
                    $rootScope.$broadcast('prepareChartContainers', this.cs.labels);

                    // Update dimension summary
                    if (this.cs.labels.length > 0) {
                        this.updateDimensions();
                    } else {
                        this.reset();
                    }
                }
            };

            var _createMultidimensionalChart = function (label, el) {
                var _chart, _min, _max;

                // Check if label0 or label1 has categorical values
                if (label.label[0].type === 'string' || label.label[1].type === 'string') {

                    // Check if one of them is not categorical
                    if (label.label[0].type !== 'string' || label.label[1].type !== 'string') {

                        // Always categorical on X axis
                        var _valueX = label.label[0].type === 'string' ? 0 : 1;
                        var _valueY = _valueX === 0 ? 1 : 0;

                        chartService.cs.dimensions[label.labelId] = chartService.cs.crossfilter.dimension(function (d) {
                            return d.labels[label.labelId] ? d.labels[label.labelId][_valueX] : undefined;
                        });
                        chartService.cs.groups[label.labelId] = chartService.cs.dimensions[label.labelId].group().reduce(
                            function (p, v) {
                                p.push(v.labels[label.labelId] ? +v.labels[label.labelId][_valueY] : undefined);
                                return p;
                            },
                            function (p, v) {
                                p.splice(p.indexOf(v.labels[label.labelId] ? +v.labels[label.labelId][_valueY] : undefined), 1);
                                return p;
                            },
                            function () {
                                return [];
                            }
                        );

                        _max = chartService.cs.dimensions[label.label[_valueY].labelId].top(1)[0].labels[label.label[_valueY].labelId];
                        _min = chartService.cs.dimensions[label.label[_valueY].labelId].bottom(1)[0].labels[label.label[_valueY].labelId];

                        _chart = DcChartsService.getBoxPlot(chartService.cs.dimensions[label.labelId], chartService.cs.groups[label.labelId], el, {
                            xLab: label.label[_valueX].name,
                            yLab: label.label[_valueY].name,
                            min: _min,
                            max: _max
                        });

                        _chart.type = 'BOXPLOT';

                    } else {
                        // Both labels are categorical
                        chartService.cs.dimensions[label.labelId] = chartService.cs.crossfilter.dimension(function (d) {
                            return [d.labels[label.labelId] ? d.labels[label.labelId][0] : undefined,
                                d.labels[label.labelId] ? d.labels[label.labelId][1] : undefined];
                        });
                        chartService.cs.groups[label.labelId] = chartService.cs.dimensions[label.labelId].group();

                        _chart = DcChartsService.getHeatMap(chartService.cs.dimensions[label.labelId], chartService.cs.groups[label.labelId], el, {
                            xLab: label.label[0].name,
                            yLab: label.label[1].name
                        });

                        _chart.type = 'HEATMAP';

                    }
                } else {
                    // Both labels are numerical, create a scatter plot
                    chartService.cs.dimensions[label.labelId] = chartService.cs.crossfilter.dimension(function (d) {
                        return [d.labels[label.labelId] ? d.labels[label.labelId][0] : undefined,
                            d.labels[label.labelId] ? d.labels[label.labelId][1] : undefined];
                    });

                    chartService.cs.groups[label.labelId] = chartService.cs.dimensions[label.labelId].group();

                    _max = chartService.cs.dimensions[label.label[0].labelId].top(1)[0].labels[label.label[0].labelId];
                    _min = chartService.cs.dimensions[label.label[0].labelId].bottom(1)[0].labels[label.label[0].labelId];

                    _chart = DcChartsService.getScatterPlot(
                        chartService.cs.dimensions[label.labelId],
                        chartService.cs.groups[label.labelId],
                        el,
                        {
                            min: _min,
                            max: _max,
                            xLab: label.label[0].name,
                            yLab: label.label[1].name
                        }
                    );

                    _chart.type = 'SCATTER';
                }

                return _chart;
            };

            /**
             * Create the charts for each selected label
             * @memberof ChartService
             * @param {Object} label
             * @param {Object} el
             */
            chartService.createCohortChart = function (label, el) {
                var _chart;

                /**
                 *
                 * @param _missingLabelId
                 * @private
                 */
                var _defaultDim = function (_missingLabelId) {
                    chartService.cs.dimensions[label.labelId] = chartService.cs.crossfilter.dimension(function (d) {
                        var lbl = _missingLabelId || undefined;
                        return d.labels[label.labelId] === undefined ? lbl : d.labels[label.labelId];
                    });
                    chartService.cs.groups[label.labelId] = chartService.cs.dimensions[label.labelId].group();
                };

                if (label.type === 'combination') {
                    _chart = _createMultidimensionalChart(label, el);
                } else {
                    // Create a number display if highdim
                    if (label.type === 'highdim') {
                        _defaultDim();
                        _chart = _numDisplay(chartService.cs.dimensions[label.labelId], chartService.cs.groups[label.labelId], el);
                        _chart.type = 'NUMBER';

                        // Create a PIECHART if categorical
                    } else if (label.type === 'string' || label.type === 'object') {
                        _defaultDim("N/A");
                        _chart = DcChartsService.getPieChart(chartService.cs.dimensions[label.labelId], chartService.cs.groups[label.labelId], el);
                        _chart.type = 'PIECHART';

                        // Create a BARCHART if numerical
                    } else if (label.type === 'number') {
                        _defaultDim(Infinity);
                        var group = chartService.cs.dimensions[label.labelId].group();
                        // Filter out all records that do not have a value (which are set to Infinity in the dimension)
                        // To do this, we clone the group (we want to keep the methods) and override all().
                        var filteredGroup = {};
                        angular.copy(group, filteredGroup);
                        filteredGroup.all = function () {
                            return group.all().filter(function (d) {
                                return d.key != Infinity;
                            });
                        };
                        chartService.cs.groups[label.labelId] = filteredGroup;
                        _chart = DcChartsService.getBarChart(chartService.cs.dimensions[label.labelId], filteredGroup, el,
                            {nodeTitle: label.name});
                        _chart.type = 'BARCHART';

                        // Create a BARCHART WITH BINS if floating point values
                    } else if (label.type === 'float') {
                        chartService.cs.dimensions[label.labelId] = chartService.cs.crossfilter.dimension(function (d) {
                            return d.labels[label.labelId] === undefined ? undefined : d.labels[label.labelId].toFixed(label.precision === 0 ? 0 : label.precision);
                        });
                        chartService.cs.groups[label.labelId] = chartService.cs.dimensions[label.labelId].group();
                        _chart = DcChartsService.getBarChart(chartService.cs.dimensions[label.labelId], chartService.cs.groups[label.labelId],
                            el, {nodeTitle: label.name, float: true, precision: label.precision});
                        _chart.type = 'BARCHART';
                    }
                }

                _chart.id = label.labelId;
                _chart.tsLabel = label;

                _chart.render(); // render chart here

                this.cs.charts.push(_chart);

                /*
                 * when a sub-categorical label is dropped and the corresponding (parent) pie-chart is created,
                 * apply the filter of the sub-category on the chart
                 */
                if (label.filters !== undefined) {
                    _filterChart(_chart, label.filters);
                }

                return _chart;
            };

            chartService.resizeChart = function (_chart) {

                var width = (_chart.gridInfo.sizeX * _chart.gridInfo.curColWidth) - 50;
                var height = (_chart.gridInfo.sizeY * _chart.gridInfo.curRowHeight) - 60;

                var _CONF = {
                    RAD: 0.9, // Percentage to adjust the radius of the chart
                    LEG_H: 0.05,// Percentage to adjust legend position in Y
                    LEG_W: 0, // Percentage to adjust legend position in X
                    LEG_S: 0.03, // Legend size percentage of chart
                    LEG_B: 4, // Legend size base in px
                    LEG_G: 0.02, // Legend gap in percentage of chart height
                    MIN_S: (width > height ? height : width), // Smallest of width or height
                    TICK_X: 30, // Pixels per tick in x
                    TICK_Y: 30, // Pixels per tick in y
                    SLICE: 20, // Pixels per slice for pie charts
                    SP_DOT_SIZE: 4, // Pixels per width / height
                    BP_PIXELS_PER_GROUP: 110,
                    HM_LEFT_MARGIN: width / 6,
                    HM_Y_LABELS_PIXELS: 10
                };


                // Adjust width and height
                _chart.width(width).height(height);

                // If the chart has a radius (ie. pie chart)
                if (_chart.type === 'PIECHART') {
                    //  set the radius to half the shortest dimension
                    _chart.radius((_CONF.MIN_S) / 2 * _CONF.RAD)
                    // Limit the number of slices in the chart
                        .slicesCap(Math.floor(_CONF.MIN_S / _CONF.SLICE))
                        //
                        .legend(dc.legend()
                            .x(width * _CONF.LEG_W)
                            .y(height * _CONF.LEG_H)
                            .itemHeight(_CONF.LEG_B + _CONF.LEG_S * _CONF.MIN_S)
                            .gap(_CONF.MIN_S * _CONF.LEG_G));

                } else if (_chart.type === 'BARCHART') {
                    // Adjust number of ticks to not overlap
                    // Number of ticks per pixel
                    _chart.xAxis().ticks(Math.floor(width / _CONF.TICK_X));
                    _chart.yAxis().ticks(Math.floor(height / _CONF.TICK_Y));
                    _chart.rescale();

                } else if (_chart.type === 'BOXPLOT') {
                    _chart.margins({top: 5, right: 5, bottom: 45, left: 40});

                    if (_chart.group().all().length > width / _CONF.BP_PIXELS_PER_GROUP) {
                        _chart.xAxis().tickValues([]);
                        _chart.yAxis().ticks(3);
                    } else {
                        _chart.yAxis().ticks(Math.floor(height / _CONF.TICK_Y));
                        _chart.xAxis().tickValues(null);
                    }

                } else if (_chart.type === 'HEATMAP') {
                    _chart
                        .keyAccessor(function (d) {
                            return d.key[0] ? d.key[0].slice(0, Math.floor(width / 80)) : undefined;
                        })
                        .valueAccessor(function (d) {
                            return d.key[1] ? d.key[1].slice(0, Math.floor(width / 50)) : undefined;
                        })
                        .colorAccessor(function (d) {
                            return d.value;
                        })
                        .margins({top: 5, right: 5, bottom: 40, left: _CONF.HM_LEFT_MARGIN});

                } else if (_chart.type === 'SCATTER') {
                    // Adjust number of ticks to not overlap
                    // Number of ticks per pixel
                    _chart.xAxis().ticks(Math.floor(width / _CONF.TICK_X));
                    _chart.yAxis().ticks(Math.floor(height / _CONF.TICK_Y));
                    // Adjust the size of the dots
                    _chart.symbolSize(_CONF.SP_DOT_SIZE);
                    _chart.rescale();
                }
                _chart.render();
            };

            /**
             * Return active filters
             * @memberof ChartService
             */
            chartService.getCohortFilters = function () {
                var _filters = [];

                if (chartService.cs.charts) {
                    _.each(chartService.cs.charts, function (c, _index) {
                        _filters.push({
                            name: chartService.cs.labels[_index].name,
                            label: chartService.cs.labels[_index].label,
                            type: chartService.cs.labels[_index].type,
                            study: chartService.cs.labels[_index].study,
                            filters: c.filters()
                        });
                    });
                }

                return _filters;
            };

            /**
             * Get summary data
             * @memberof ChartService
             */
            chartService.updateDimensions = function () {
                this.cs.selected = this.cs.crossfilter.groupAll().value();    // # of selected subjects
                this.cs.selectedSubjects = this.cs.mainDimension.top(Infinity);
                this.cs.total = this.cs.crossfilter.size();                   // # of total of subjects
                this.cs.cohortLabels = this.cs.labels;
            };

            /**
             * @memberof ChartService
             * @param {String} chartName - The chart name as the search word for the chart with tsLabel with the same string
             * @returns {*} - The found chart in ChartService.cs.charts, with matching name chartName, if not found, return null
             */
            function _findChartByName(chartName) {
                var foundChart = null;
                chartService.cs.charts.forEach(function (_chart) {
                    if (_chart.tsLabel.label == chartName) {
                        foundChart = _chart;
                    }
                });
                return foundChart;
            }

            /**
             * Give a chart instance (normally a pie chart), filter it based on an array of words
             * @memberof ChartService
             * @param {Object} chart - The chart instance in ChartService.cs.charts
             * @param {Array} filters - The filtering words or criteria that filter the chart
             */
            function _filterChart(chart, filters) {
                if(_.isArray(filters) && filters.length > 0) {
                    filters.forEach(function (_f) {
                        chart.filter(_f);
                    });
                    chartService.updateDimensions();
                    dc.renderAll();
                }
            }

            /**
             * Handle node drop from study-accordion to cohort-selection panel.
             * Remark: node.restObj.fullName is equivalent to chart.tsLabel.label
             * @memberof ChartService
             * @param {Object} node
             */
            chartService.onNodeDrop = function (node) {
                if (node.type === 'CATEGORICAL_OPTION') { //leaf node for pie chart
                    var chart = _findChartByName(node.parent.restObj.fullName);
                    if (chart == null) {
                        var filters = [{
                            label: node.parent.restObj.fullName,
                            filterWords: [node.title]
                        }];
                        chartService.addNodeToActiveCohortSelection(node.parent, filters);
                    }
                    else {
                        _filterChart(chart, node.title);
                    }
                }
                else {
                    chartService.addNodeToActiveCohortSelection(node);
                }
            };

            return chartService;

        }]);
