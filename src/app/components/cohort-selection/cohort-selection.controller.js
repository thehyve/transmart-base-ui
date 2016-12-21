'use strict';

angular.module('transmartBaseUi')
    /**
     * The cohort-selection controller, where cohort-chart
     * creation, update and removal are managed
     * @memberof transmartBaseUi
     * @ngdoc controller
     * @name CohortSelectionCtrl
     */
    .controller('CohortSelectionCtrl',
        ['$q', '$element', '$scope', 'CohortSelectionService', 'StudyListService', 'DcChartsService',
            'AlertService', '$uibModal', 'TreeNodeService', 'CohortExportService', 'ContentService',
            function ($q, $element, $scope, CohortSelectionService, StudyListService, DcChartsService,
                      AlertService, $uibModal, TreeNodeService, CohortExportService, ContentService) {
                var vm = this;
                vm.$scope = $scope;
                vm.isRecordingHistory = false;
                vm.boxIndex = (+$scope.index + 1);
                vm.boxName = 'Cohort-' + vm.boxIndex;
                vm.boxElm = $element;
                vm.boxes = CohortSelectionService.boxes;
                vm.domElement = $element;
                vm.history = [];

                vm.cs = {};
                vm.gridsterOpts = {
                    // whether to push other items out of the way on move or resize
                    pushing: true,
                    /*
                     * floating: whether to automatically float items up so they stack --
                     * this option, if set to true, will alleviate the problem where
                     * dragging one item pushes the others away and produces wasted empty spaces
                     */
                    floating: true,
                    // whether or not to have items of the same size switch places instead
                    // of pushing down if they are the same size
                    swapping: true,
                    // the pixel distance between each widget
                    margins: [10, 10],
                    // whether margins apply to outer edges of the grid
                    outerMargin: false,
                    // the minimum columns the grid must have
                    minColumns: 1,
                    // the minimum height of the grid, in rows
                    minRows: 1,
                    // maximum number of rows
                    maxRows: 100,
                    // minimum column width of an item
                    minSizeX: 1,
                    // maximum column width of an item
                    maxSizeX: null,
                    // minumum row height of an item
                    minSizeY: 1,
                    // maximum row height of an item
                    maxSizeY: null,
                    mobileBreakPoint: 200, // if the screen is not wider that this, remove the grid layout and stack
                    // the items
                    mobileModeEnabled: true, // whether or not to toggle mobile mode when screen width is less than mobileBreakPoint
                    resizable: {
                        enabled: true,
                        handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw']
                    },
                    draggable: {
                        enabled: true, // whether dragging items is supported
                        handle: '.chart-drag-handle' // optional selector for resize handle
                    }
                };
                vm.gridsterConfig = {
                    // Base width for a gridster square, this value will be adapted to fit
                    // exaclty an even number of squares in the grid according to window size
                    G_BASE_WIDTH: 230,
                    // Number of columns a gridster item will occupy by default
                    G_ITEM_SPAN_X: 1,
                    // Number of rows a gridster item will occupy by default
                    G_ITEM_SPAN_Y: 1
                };

                /**
                 * Reset the cohort chart service to initial state
                 * @memberof CohortSelectionCtrl
                 */
                vm.reset = function () {
                    vm.cs = {};
                    vm.cs.subjects = [];
                    vm.cs.selectedSubjects = [];
                    vm.cs.chartId = 0;
                    vm.cs.charts = [];
                    vm.cs.crossfilter = crossfilter();
                    vm.cs.dimensions = [];
                    vm.cs.maxNoOfDimensions = 20;
                    vm.cs.groups = [];
                    vm.cs.labels = [];
                    vm.cs.nodes = [];
                    vm.cs.selected = 0;
                    vm.cs.total = 0;
                    vm.cs.mainDimension = vm.cs.crossfilter.dimension(function (d) {
                        // return a column attribute so that the rows are sorted according to
                        // that attribute, in this case, sorting the subjects w.r.t their ids
                        return d.id;
                    });
                    vm.history = [];

                    var box = CohortSelectionService.getBox(vm.boxId);
                    if(box) box.studyId = undefined;
                };

                /**
                 * The positions and sizes of the charts are reinitialized
                 * @memberof CohortSelectionCtrl
                 */
                vm.reSizeAndPosition = function () {
                    var labels = vm.cs.labels;
                    //If there is any label to be positioned in the first place
                    if (labels.length > 0) {
                        var elId = '#' + vm.mainContainerId;
                        // Get width of the full gridster grid
                        var _gWidth = angular.element(elId).width();
                        if (_gWidth <= 0) {
                            _gWidth = angular.element('#main-container-div').width();
                        }
                        // Calculate the number of columns in the grid according to full gridster
                        // grid size and the base square size. Adjust by -1 if number of columns
                        // is not pair.
                        var _gCols = Math.floor(_gWidth / vm.gridsterConfig.G_BASE_WIDTH);
                        vm.gridsterOpts.columns = _gCols;

                        labels = _.sortBy(labels, ['row', 'col']);
                        labels.forEach(function (label, index) {
                            label.sizeX = vm.gridsterConfig.G_ITEM_SPAN_X;
                            label.sizeY = vm.gridsterConfig.G_ITEM_SPAN_Y;
                            // Spread items left to right
                            label.col = (index * label.sizeX) % _gCols;
                            // And top to bottom
                            label.row = Math.floor((index * label.sizeX) / _gCols) * label.sizeY;
                        });
                    }
                };

                /**
                 * Only re-initialize the positions of the charts, no size changing
                 * @memberof CohortSelectionCtrl
                 */
                vm.rePosition = function () {
                    var labels = vm.cs.labels;
                    //If there is any label to be positioned in the first place
                    if (labels.length > 0) {
                        var elId = '#' + vm.mainContainerId;
                        // Get width of the full gridster grid
                        var _gWidth = angular.element(elId).width();
                        if (_gWidth <= 0) {
                            _gWidth = angular.element('#main-container-div').width();
                        }
                        // Calculate the number of columns in the grid according to full gridster
                        // grid size and the base square size. Adjust by -1 if number of columns
                        // is not pair.
                        var _gCols = Math.floor(_gWidth / vm.gridsterConfig.G_BASE_WIDTH);
                        vm.gridsterOpts.columns = _gCols;

                        var colIndex = 0, rowIndex = 0;
                        var rowOffset = 0;

                        labels = _.sortBy(labels, ['row', 'col']);
                        labels.forEach(function (label, index) {
                            if (!label.sizeX) label.sizeX = vm.gridsterConfig.G_ITEM_SPAN_X;
                            if (!label.sizeY) label.sizeY = vm.gridsterConfig.G_ITEM_SPAN_Y;
                            label.col = colIndex;
                            label.row = rowIndex;
                            if (label.sizeY > rowOffset) {
                                rowOffset = label.sizeY;
                            }
                            colIndex += label.sizeX;
                            if (colIndex >= _gCols) {
                                colIndex = 0;
                                rowIndex += rowOffset;
                                rowOffset = 0;
                            }
                        });
                    }
                };

                /**
                 * Different from vm.rePosition, this function
                 * detects gaps and inserts the new chart(s)
                 * @memberof CohortSelectionCtrl
                 */
                vm.reOrganize = function () {
                    var labels = vm.cs.labels;
                    //If there is any label to be positioned in the first place
                    if (labels.length > 0) {
                        var elId = '#' + vm.mainContainerId;
                        // Get width of the full gridster grid
                        var _gWidth = angular.element(elId).width();
                        if (_gWidth <= 0) {
                            _gWidth = angular.element('#main-container-div').width();
                        }
                        // Calculate the number of columns in the grid according to full gridster
                        // grid size and the base square size. Adjust by -1 if number of columns
                        // is not pair.
                        var _gCols = Math.floor(_gWidth / vm.gridsterConfig.G_BASE_WIDTH);
                        vm.gridsterOpts.columns = _gCols;

                        var cells = [], // the cells that existing charts occupy
                            labelsToBeResized = [], // the labels corresponding the un-positioned charts
                            rows = Math.ceil(labels.length / _gCols),// num of existing rows
                            cols = _gCols, // num of existing cols
                            lastCell = {col: 0, row: 0}; // the last cell from left to right, top to bottom

                        /*
                         * For each label, find existing cells and un-positioned labels,
                         * each cell occupies 1x1 space,
                         * also identify the last cell
                         */
                        labels.forEach(function (label, index) {
                            if (label.sizeX) {
                                for (var i = 0; i < label.sizeX; i++) {
                                    for (var j = 0; j < label.sizeY; j++) {
                                        var cell = {
                                            col: +label.col + i,
                                            row: +label.row + j
                                        };
                                        cells.push(cell);
                                        if (cell.col > lastCell.col || cell.row > lastCell.row) {
                                            lastCell = cell;
                                        }
                                    }
                                }
                            }
                            else {
                                labelsToBeResized.push(label);
                            }
                        });

                        /*
                         * Find gaps that might exist among existing cells,
                         * and put these gaps into availableCells for future use
                         */
                        var availableCells = [];
                        if (cells.length === 0) {
                            // If these is no existing cell, construct availableCells sequentially
                            for (var i = 0; i < rows; i++) {
                                for (var j = 0; j < cols; j++) {
                                    var cell = _.find(cells, {row: i, col: j});
                                    if (!cell) {
                                        availableCells.push({row: i, col: j});
                                    }
                                }
                            }
                        }
                        else {
                            // If there are existing cells, find their neighbors to
                            // the left or right, if these neighbors do not overlap with
                            // other existing cells, put them into availabelCells
                            cells.forEach(function (cell) {
                                var neighborLeft = {
                                    col: cell.col - 1,
                                    row: cell.row
                                };
                                if (neighborLeft.col < 0) {
                                    neighborLeft.col = 0;
                                }
                                var foundNeighborLeft = _.find(cells, neighborLeft);

                                var duplicateLeft = _.find(availableCells, neighborLeft);
                                if (!foundNeighborLeft && !duplicateLeft) {
                                    availableCells.push(neighborLeft);
                                }

                                var neighborRight = {
                                    col: cell.col + 1,
                                    row: cell.row
                                };
                                if (neighborRight.col > _gCols - 1) {
                                    neighborRight.col = 0;
                                }
                                var foundNeighborRight = _.find(cells, neighborRight);
                                var duplicateRight = _.find(availableCells, neighborRight);
                                if (!foundNeighborRight && !duplicateRight) {
                                    availableCells.push(neighborRight);
                                }
                            });
                        }
                        /*
                         * If there are not enough available cells for the un-positioned labels,
                         * simply attach new cells to the tail of the cell grid
                         */
                        var diff = labelsToBeResized.length - availableCells.length;
                        if (diff > 0) {
                            _.times(diff, function () {
                                var col = lastCell.col + 1;
                                var row = lastCell.row;
                                if (col > _gCols - 1) {
                                    col = 0;
                                    row++;
                                }
                                var foundCell = _.find(availableCells, {col: col, row: row});
                                if (!foundCell) {
                                    availableCells.push({col: col, row: row});
                                }
                            });
                        }

                        //prioritize the available cells
                        availableCells = _.sortBy(availableCells, ['col', 'row']);
                        /*
                         * For each new label, assign its position based on available cells
                         */
                        labelsToBeResized.forEach(function (label, index) {
                            var cell = availableCells[index];
                            if (!label.sizeX) label.sizeX = vm.gridsterConfig.G_ITEM_SPAN_X;
                            if (!label.sizeY) label.sizeY = vm.gridsterConfig.G_ITEM_SPAN_Y;
                            if (!label.col) {
                                if (cell) label.col = cell.col;
                                else label.col = 0;
                            }
                            if (!label.row) {
                                if (cell) label.row = cell.row;
                                else label.row = 0;
                            }
                        });
                    }
                };


                /**
                 * Restore the data of the crossfilter to full set
                 * @memberOf CohortSelectionCtrl
                 */
                vm.restoreCrossfilter = function () {
                    if (vm.cs.subjects && vm.cs.subjects.length > 0) {
                        vm.cs.crossfilter = crossfilter(vm.cs.subjects);
                        return true;
                    }
                    else {
                        return false;
                    }
                };

                /**
                 * Get summary data
                 * @memberof CohortSelectionCtrl
                 */
                vm.updateDimensions = function () {
                    vm.cs.selected = vm.cs.crossfilter.groupAll().value(); // # of selected subjects
                    vm.cs.selectedSubjects = vm.cs.mainDimension.top(Infinity);
                    vm.cs.total = vm.cs.crossfilter.size(); // # of total of subjects
                    vm.cs.cohortLabels = vm.cs.labels;
                };

                vm.restoreCrossfilter();

                // Initialize the chart service only if uninitialized
                if (!vm.cs.mainDimension) {
                    vm.reset();
                }

                $scope.$watchCollection(function () {
                    return vm.cs;
                }, function (newValue, oldValue) {
                    if (!_.isEqual(newValue, oldValue)) {
                        $scope.$emit('cohortSelectionUpdateEvent');
                    }
                });

                /**
                 * Clear all the charts from the current cohort selection
                 * @memberof CohortSelectionCtrl
                 */
                vm.clearSelection = function () {
                    vm.reset();
                    vm.updateDimensions();
                };

                /**
                 * Export workspace as PNG/PDF
                 * @memberof CohortSelectionCtrl
                 */
                vm.exportWorkspace = function (imgType) {
                    var targetDiv = null;
                    var cohortSelectionDivs = angular.element('cohort-selection');

                    _.forEach(cohortSelectionDivs, function (div) {
                        var targetId = angular.element(div).attr('id');
                        if (targetId === vm.boxId) {
                            targetDiv = div;
                        }
                    });
                    CohortExportService.exportWorkspaceImage(targetDiv, imgType);
                };

                /**
                 * Combine two charts to form a third chart, with filtering option
                 * @param chart1
                 * @param chart2
                 * @param filterObj
                 * @memberof CohortSelectionCtrl
                 */
                vm.combineCharts = function (chart1, chart2, filterObj) {

                    var _combinationLabel = {
                        labelId: vm.cs.chartId++,
                        labels: [chart1.tsLabel, chart2.tsLabel],
                        name: chart1.tsLabel.name + ' - ' + chart2.tsLabel.name,
                        resolved: false,
                        study: chart1.tsLabel.study,
                        filters: filterObj ? filterObj.dcFilters : undefined,
                        type: 'combination',
                        boxId: vm.boxId,
                        box: CohortSelectionService.getBox(vm.boxId)
                    };

                    vm.cs.subjects.forEach(function (subject) {
                        if (subject.observations[chart1.tsLabel.conceptPath] ||
                            subject.observations[chart2.tsLabel.conceptPath]) {

                            subject.observations[_combinationLabel.name] = [
                                subject.observations[chart1.tsLabel.conceptPath],
                                subject.observations[chart2.tsLabel.conceptPath]
                            ];
                        }
                    });

                    vm.cs.labels.push(_combinationLabel);

                    //add combination node to the node list
                    var combinationNode = {
                        label: _combinationLabel,
                        type: 'COMBINATION',
                        chart1: chart1,
                        chart2: chart2
                    };
                    _combinationLabel.node = combinationNode;

                    vm.cs.nodes.push(combinationNode);
                    vm.reOrganize();
                };

                vm.currentChartGrouping = {};

                vm.groupCharts = function (newChart, turnOff) {
                    // If a first chart was already selected, group them together
                    if (vm.currentChartGrouping.chartOne) {
                        vm.combineCharts(newChart, vm.currentChartGrouping.chartOne);
                        // Turn off both selection lights
                        vm.currentChartGrouping.turnOff();
                        turnOff();
                        vm.currentChartGrouping = {};
                        // If this is the first chart selected
                    } else {
                        vm.currentChartGrouping.chartOne = newChart;
                        vm.currentChartGrouping.turnOff = turnOff;
                    }
                };

                /**
                 * Get the last token when requested model is a string path
                 * @memberof CohortSelectionCtrl
                 * @param {String} what
                 * @returns {*}
                 */
                var _getLastToken = function (what) {
                    var _t = what.split('\\').slice(1);
                    return what.indexOf('\\') === -1 ? what : _t[_t.length - 2];
                };


                /**
                 * Add new label to list and check data type
                 * @param obs
                 * @param node
                 * @param filterObj
                 * @returns {int} labelId
                 * @private
                 */
                vm.addLabel = function (obs, node, filterObj) {
                    // Check if label has already been added
                    var label = _.find(vm.cs.labels, {label: obs.label});

                    if (!label) {

                        //Check that the maximum number of dimensions has not been reached
                        if (vm.cs.labels.length < vm.cs.maxNoOfDimensions) {
                            // Create the new label object
                            label = {
                                label: obs.label,
                                conceptPath: obs.label,
                                type: CohortSelectionService.getLabelType(obs.value),
                                name: _getLastToken(obs.label),
                                labelId: vm.cs.chartId++,
                                study: node.study,
                                resolved: false,
                                filters: filterObj ? filterObj.dcFilters : undefined,
                                boxId: vm.boxId,
                                box: CohortSelectionService.getBox(vm.boxId),
                                node: node,
                                col: node.label ? node.label.col : undefined,
                                row: node.label ? node.label.row : undefined,
                                sizeX: node.label ? node.label.sizeX : undefined,
                                sizeY: node.label ? node.label.sizeY : undefined
                            };
                            node.label = label;
                            vm.cs.labels.push(label);

                        } else {
                            AlertService.add('danger', 'Max number of dimensions reached !', 2000);
                        }
                    } else {
                        // if label already exists check its type
                        label.type =
                            label.type === 'float' ? label.type : CohortSelectionService.getLabelType(obs.value);
                    }

                    if (label && label.type === 'float') {
                        var precision = (obs.value + '').split('.');
                        precision = precision[1] ? precision[1].length : 0;
                        label.precision = label.precision ? Math.min(label.precision, precision) : precision;
                    }
                    return label;
                };

                /**
                 * Give a chart instance (normally a pie chart), filter it based on an array of words
                 * @memberof CohortSelectionCtrl
                 * @param {Object} chart - The chart instance in CohortSelectionCtrl.cs.charts
                 * @param {Array} filters - The filtering words or criteria that filter the chart
                 */
                vm.filterChart = function (chart, filters) {
                    if (_.isArray(filters) && filters.length > 0) {
                        filters.forEach(function (_f) {
                            chart.filter(_f);
                        });
                        vm.updateDimensions();
                        dc.redrawAll();
                    }
                }

                /**
                 * Fetch the data for the selected node
                 * @memberof CohortSelectionCtrl
                 * @param {Object} node
                 * @param {Array} filters
                 * @returns {*}
                 */
                vm.addNodeToActiveCohortSelection = function (node, filters) {
                    var _filter, _deferred = $q.defer();

                    var _iterateObservations = function (node, filters) {
                        node.observations.forEach(function (obs) {
                            if (obs.value !== null) {
                                if (filters) {
                                    _filter = _.find(filters, {label: obs.label});
                                }
                                // Add the concept to the list of chart labels
                                var _newLabel = vm.addLabel(obs, node, _filter);
                                // Check if the subject of the observation is already present
                                var foundSubject = _.find(vm.cs.subjects,
                                    {id: obs._embedded.subject.id});
                                if (foundSubject) {
                                    foundSubject.observations[_newLabel.conceptPath] = obs.value;
                                } else {
                                    obs._embedded.subject.observations = {};
                                    obs._embedded.subject.observations[_newLabel.conceptPath] = obs.value;
                                    vm.cs.subjects.push(obs._embedded.subject);
                                    vm.cs.crossfilter.add([obs._embedded.subject]);
                                }
                            }
                        });
                        vm.reOrganize();
                        vm.updateDimensions();
                    };

                    var _loadObservations = function (node, filters) {
                        if (!node.observations) {
                            // Get all observations under the selected concept
                            node.restObj.one('observations').get().then(function (observations) {
                                node.observations = observations._embedded.observations;
                                _iterateObservations(node, filters);
                                _deferred.resolve();
                            }, function (err) {
                                _deferred.reject('Cannot get data from the end-point.' + err);
                            });
                        }
                        else {
                            _iterateObservations(node, filters);
                            _deferred.resolve();
                        }
                    };


                    //if the node is not a combination node for combination chart
                    if (node.type !== 'COMBINATION') {
                        if (node.nodes.length == 0) {
                            var treeNodePromise = TreeNodeService.getNodeChildren(node);
                            treeNodePromise.then(function () {
                                if (node.nodes.length == 0 ||
                                    TreeNodeService.isCategoricalLeafNode(node.nodes[0])) {
                                    vm.addNode(node);
                                    _loadObservations(node, filters);
                                }
                                else {
                                    node.nodes.forEach(function (child) {
                                        vm.addNodeToActiveCohortSelection(child, filters);
                                    });
                                }
                            });
                        }
                        else if (TreeNodeService.isCategoricalLeafNode(node.nodes[0])) {
                            vm.addNode(node);
                            _loadObservations(node, filters);
                        }
                        else {
                            node.nodes.forEach(function (child) {
                                vm.addNodeToActiveCohortSelection(child, filters);
                            });
                        }
                    }
                    //if the node is a combination node for combination chart
                    else {
                        vm.combineCharts(node.chart1, node.chart2, filters[0]);
                        _deferred.resolve();
                    }

                    return _deferred.promise;
                };


                /**
                 * Remove label from subjects and remove subjects no longer associated with any given label
                 * @memberof CohortSelectionCtrl
                 * @param {Array} subjects
                 * @param {String} label
                 * @returns {*}
                 */
                vm.filterSubjectsByLabel = function (subjects, label) {
                    subjects.forEach(function (subject, subjectIdx) {
                        delete subject.observations[label.conceptPath];
                    });
                    return subjects;
                };

                /**
                 * Remove a label from label collection
                 * @memberof CohortSelectionCtrl
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
                 * @memberof CohortSelectionCtrl
                 * @param {Array} charts
                 * @param {Object} label
                 * @returns {Array}
                 */
                var _removeChartFromCharts = function (charts, label) {
                    return _.filter(charts, function (chartToBeRemoved) {
                        if (chartToBeRemoved.id === label.labelId) {
                            chartToBeRemoved.filter(null); // clear filter
                            dc.chartRegistry.deregister(chartToBeRemoved);
                        }
                        return chartToBeRemoved.id !== label.labelId;
                    });
                };

                /**
                 * Clear chart's filter
                 * @memberof CohortSelectionCtrl
                 * @param {Object} label
                 * @returns {Object} chart
                 */
                vm.clearChartFilterByLabel = function (label) {
                    var chart;
                    chart = _.find(vm.cs.charts, {id: label.labelId});
                    if (chart) {
                        chart.filter(null);
                        dc.redrawAll();
                        vm.updateDimensions();
                    }
                    return chart;
                };

                /**
                 * Clear the filters of the charts and reset their gridster layout
                 * @memberof CohortSelectionCtrl
                 */
                vm.resetCharts = function () {
                    vm.cs.charts.forEach(function (_chart) {
                        _chart.filter(null);
                    });
                    vm.updateDimensions();
                    vm.reSizeAndPosition();
                    dc.redrawAll();
                };

                /**
                 * Remove label from cohort selection
                 * @memberof CohortSelectionCtrl
                 * @param {Object} label
                 */
                vm.removeLabel = function (label) {
                    var _deferred = $q.defer();

                    if (label) {
                        vm.removeNode(label);

                        // Remove associated chart from cs.charts
                        vm.cs.charts = _removeChartFromCharts(vm.cs.charts, label);

                        // Remove label from cs.labels
                        vm.cs.labels = _removeLabelFromLabels(vm.cs.labels, label);

                        // Remove label from cs.subjects and remove subjects no longer associated
                        // with any label
                        vm.cs.subjects =
                            vm.filterSubjectsByLabel(vm.cs.subjects, label);

                        // Remove dimension and group associated with the label
                        vm.cs.dimensions.splice(label.labelId);
                        vm.cs.groups.splice(label.labelId);
                        // Remove data in crossfilter if no more label is selected
                        if (vm.cs.labels.length < 1) {
                            // Removes all records that match the current filter
                            vm.cs.crossfilter.remove();
                        }
                        // Update dimension summary
                        if (vm.cs.labels.length > 0) {
                            vm.updateDimensions();
                        } else {
                            vm.reset();
                        }

                        vm.addHistory('removeLabel', [label]);
                        _deferred.resolve();
                    }
                    else {
                        _deferred.reject('label is not defined');
                    }

                    dc.redrawAll();
                    return _deferred.promise;
                };

                vm.createMultidimensionalChart = function (label, el) {
                    var _chart, _min, _max, label1 = label.labels[0], label2 = label.labels[1];

                    // Check if label0 or label1 has categorical values
                    if (label1.type === 'string' || label2.type === 'string') {

                        // Check if one of them is not categorical
                        if (label1.type !== 'string' || label2.type !== 'string') {

                            // Always categorical on X axis
                            var _valueX = label1.type === 'string' ? 0 : 1;
                            var _valueY = _valueX === 0 ? 1 : 0;

                            vm.cs.dimensions[label.labelId] =
                                vm.cs.crossfilter.dimension(function (d) {
                                    return d.observations[label.labels[_valueX].conceptPath] ?
                                        d.observations[label.labels[_valueX].conceptPath] : undefined;
                                });

                            vm.cs.groups[label.labelId] =
                                vm.cs.dimensions[label.labelId].group().reduce(
                                    function (p, v) {
                                        p.push(v.observations[label.labels[_valueY].conceptPath] ?
                                            +v.observations[label.labels[_valueY].conceptPath] : undefined);
                                        return p;
                                    },
                                    function (p, v) {
                                        p.splice(p.indexOf(v.observations[label.labels[_valueY].conceptPath] ?
                                            +v.observations[label.labels[_valueY].conceptPath] : undefined), 1);
                                        return p;
                                    },
                                    function () {
                                        return [];
                                    }
                                );

                            _max = vm.cs.dimensions[label.labels[_valueY].labelId]
                                .top(1)[0].observations[label.labels[_valueY].conceptPath];
                            _min = vm.cs.dimensions[label.labels[_valueY].labelId]
                                .bottom(1)[0].observations[label.labels[_valueY].conceptPath];

                            _chart = DcChartsService.getBoxPlot(vm.cs.dimensions[label.labelId],
                                vm.cs.groups[label.labelId], el, {
                                    xLab: label.labels[_valueX].name,
                                    yLab: label.labels[_valueY].name,
                                    min: _min,
                                    max: _max
                                });

                            _chart.type = 'BOXPLOT';

                        } else {
                            // Both labels are categorical
                            vm.cs.dimensions[label.labelId] =
                                vm.cs.crossfilter.dimension(function (d) {
                                    return [
                                        d.observations[label.labels[0].conceptPath] ?
                                            d.observations[label.labels[0].conceptPath] : undefined,
                                        d.observations[label.labels[1].conceptPath] ?
                                            d.observations[label.labels[1].conceptPath] : undefined
                                    ];
                                });
                            vm.cs.groups[label.labelId] = vm.cs.dimensions[label.labelId].group();

                            _chart = DcChartsService.getHeatMap(vm.cs.dimensions[label.labelId],
                                vm.cs.groups[label.labelId], el, {
                                    xLab: label.labels[0].name,
                                    yLab: label.labels[1].name
                                });
                            _chart.type = 'HEATMAP';

                        }
                    } else {
                        // Both labels are numerical, create a scatter plot
                        vm.cs.dimensions[label.labelId] =
                            vm.cs.crossfilter.dimension(function (d) {
                                return [
                                    d.observations[label1.conceptPath] ?
                                        d.observations[label1.conceptPath] : undefined,
                                    d.observations[label2.conceptPath] ?
                                        d.observations[label2.conceptPath] : undefined
                                ];
                            });

                        vm.cs.groups[label.labelId] =
                            vm.cs.dimensions[label.labelId].group();

                        _max = vm.cs.dimensions[label1.labelId]
                            .top(1)[0].observations[label1.conceptPath];
                        _min = vm.cs.dimensions[label1.labelId]
                            .bottom(1)[0].observations[label1.conceptPath];

                        _chart = DcChartsService.getScatterPlot(
                            vm.cs.dimensions[label.labelId],
                            vm.cs.groups[label.labelId],
                            el,
                            {
                                min: _min,
                                max: _max,
                                xLab: label1.name,
                                yLab: label2.name
                            }
                        );

                        _chart.type = 'SCATTER';
                    }

                    return _chart;
                };

                /**
                 * Create the charts for each selected label
                 * @memberof CohortSelectionCtrl
                 * @param {Object} label
                 * @param {Object} el
                 */
                vm.createCohortChart = function (label, el) {
                    var _chart;
                    /**
                     * @param _missingLabelId
                     * @private
                     */
                    var _defaultDim = function (_missingLabelId) {
                        var lbl = _missingLabelId || undefined;
                        vm.cs.dimensions[label.labelId] =
                            vm.cs.crossfilter.dimension(function (d) {
                                return d.observations[label.conceptPath] === undefined ?
                                    lbl : d.observations[label.conceptPath];
                            });
                        vm.cs.groups[label.labelId] =
                            vm.cs.dimensions[label.labelId].group();
                    };

                    if (label.type === 'combination') {
                        _chart = vm.createMultidimensionalChart(label, el);
                    } else {
                        // Create a number display if highdim
                        if (label.type === 'highdim') {
                            _defaultDim();
                            _chart = DcChartsService.getNumDisplay(label, vm.cs.groups[label.labelId], el);
                            _chart.type = 'NUMBER';

                            // Create a PIECHART if categorical
                        } else if (label.type === 'string' || label.type === 'object') {
                            _defaultDim("N/A");
                            _chart = DcChartsService.getPieChart(vm.cs.dimensions[label.labelId],
                                vm.cs.groups[label.labelId], el);
                            _chart.type = 'PIECHART';

                            // Create a BARCHART if numerical
                        } else if (label.type === 'number') {
                            _defaultDim(Infinity);
                            var group = vm.cs.dimensions[label.labelId].group();
                            // Filter out all records that do not have a value
                            // (which are set to Infinity in the dimension)
                            // To do this, we clone the group (we want to keep the methods) and override all().
                            var filteredGroup = {};
                            angular.copy(group, filteredGroup);
                            filteredGroup.all = function () {
                                return group.all().filter(function (d) {
                                    return d.key != Infinity;
                                });
                            };
                            vm.cs.groups[label.labelId] = filteredGroup;
                            _chart = DcChartsService.getBarChart(vm.cs.dimensions[label.labelId],
                                filteredGroup, el, {nodeTitle: label.name});
                            _chart.type = 'BARCHART';

                            // Create a BARCHART WITH BINS if floating point values
                        } else if (label.type === 'float') {
                            vm.cs.dimensions[label.labelId] =
                                vm.cs.crossfilter.dimension(function (d) {
                                    return d.observations[label.conceptPath] === undefined ?
                                        undefined : d.observations[label.conceptPath].toFixed(
                                        label.precision === 0 ? 0 : label.precision
                                    );
                                });
                            vm.cs.groups[label.labelId] =
                                vm.cs.dimensions[label.labelId].group();
                            _chart = DcChartsService.getBarChart(vm.cs.dimensions[label.labelId],
                                vm.cs.groups[label.labelId],
                                el, {nodeTitle: label.name, float: true, precision: label.precision});
                            _chart.type = 'BARCHART';
                        }
                    }

                    _chart.id = label.labelId;//update id
                    _chart.tsLabel = label;//update tsLabel
                    _chart.el = el;//update html obj

                    _chart.render(); // render chart here,

                    /*
                     * when a sub-categorical label is dropped and the corresponding (parent) pie-chart is created,
                     * apply the filter of the sub-category on the chart
                     */
                    if (label.filters !== undefined) {
                        vm.filterChart(_chart, label.filters);
                    }

                    this.cs.charts.push(_chart);

                    return _chart;
                };

                /**
                 * Return active filters
                 * @memberof CohortSelectionCtrl
                 */
                vm.getCohortFilters = function () {
                    var _filters = [];

                    if (vm.cs.charts) {
                        _.each(vm.cs.charts, function (c, _index) {
                            _filters.push({
                                name: vm.cs.labels[_index].name,
                                label: vm.cs.labels[_index].label,
                                type: vm.cs.labels[_index].type,
                                study: vm.cs.labels[_index].study,
                                filters: c.filters()
                            });
                        });
                    }

                    return _filters;
                };

                /**
                 * Adds the specified node and filter to the active selection.
                 * @memberof CohortSelectionCtrl
                 * @param node The node to be added to the selection
                 * @param filters Array of dc filters to be added directly to the dc chart
                 * @returns {Promise}
                 */
                vm.addNodeWithFilters = function (node, filters) {
                    vm.addHistory('addNodeWithFilters', [node, filters]);
                    var filterObjects = [{
                        label: node.restObj.fullName,
                        dcFilters: filters
                    }];
                    var promise = vm.addNodeToActiveCohortSelection(node, filterObjects);
                    return promise;
                };

                /**
                 * Handle node drop from study-accordion to cohort-selection panel.
                 * Remark: node.restObj.fullName is equivalent to chart.tsLabel.conceptPath
                 * @memberof CohortSelectionCtrl
                 * @param event
                 * @param info
                 * @param node Dropped node from the study tree
                 * @returns {Promise}
                 */
                vm.onNodeDrop = function (event, info, node) {
                    var promise = undefined;
                    var isConflict = CohortSelectionService.isNodeStudyConflict(node, vm.boxId);
                    if(!isConflict) {
                        node.label = undefined; // clear existing label

                        if (TreeNodeService.isCategoricalLeafNode(node)) { //leaf node for pie chart
                            var conceptPath = node.parent.restObj.fullName;
                            var chart = CohortSelectionService.findChartByConceptPath(conceptPath, vm.cs.charts);
                            if (chart == null) {
                                var filters = [{
                                    label: node.parent.restObj.fullName,
                                    dcFilters: [node.title]
                                }];
                                promise = vm.addNodeToActiveCohortSelection(node.parent, filters);
                            }
                            else {
                                vm.filterChart(chart, [node.title]);
                            }
                        }
                        else {
                            promise = vm.addNodeToActiveCohortSelection(node, []);
                        }
                    }
                    else {
                        var existingStudy = CohortSelectionService.getBox(vm.boxId).studyId;
                        AlertService.add('danger',
                            'Cannot mix the study ' + node.study.id + ' with the existing study ' + existingStudy);

                    }

                    angular.element(event.target).removeClass('chart-container-hover');
                    vm.addHistory('onNodeDrop', [event, info, node]);

                    return promise;
                };

                /**
                 * Add class when on node over the chart container
                 * @param e
                 * @memberof CohortSelectionCtrl
                 */
                vm.onNodeOver = function (e) {
                    return angular.element(e.target).addClass('chart-container-hover');
                };

                /**
                 * Remove class when on node over the chart container
                 * @param e
                 * @memberof CohortSelectionCtrl
                 */
                vm.onNodeOut = function (e) {
                    angular.element(e.target).removeClass('chart-container-hover');
                };

                /**
                 * Saves the cohort by asking for a name, saving it to the backend
                 * and showing the resulting id
                 * @memberof CohortSelectionCtrl
                 */
                vm.openSaveCohortModal = function () {
                    CohortSelectionService.currentBoxId = vm.boxId;
                    $uibModal.open({
                        templateUrl: 'app/components/save-cohort/save-cohort-dialog.tpl.html',
                        controller: 'SaveCohortDialogCtrl as vm',
                        animation: false
                    });
                };

                /**
                 * Switch to the "Saved Cohorts" tab
                 * @memberof CohortSelectionCtrl
                 */
                vm.switchToSavedCohortsTab = function () {
                    // switch to "Saved Cohorts" selection tab
                    ContentService.activateTab(ContentService.tabs[2].title, 'cohortView');
                };

                /**
                 * Add cohort-selection cohort-selection box
                 * @memberof CohortSelectionCtrl
                 */
                vm.addBox = function () {
                    CohortSelectionService.addBox();
                };

                /**
                 * Duplicate the current cohort-selection box
                 * @memberof CohortSelectionCtrl
                 */
                vm.duplicateBox = function () {
                    CohortSelectionService.duplicateBox(vm.boxId);
                };

                /**
                 * Remove the current cohort-selection box
                 * @memberof CohortSelectionCtrl
                 */
                vm.removeBox = function () {
                    vm.clearSelection();
                    // remove box from the service storage
                    CohortSelectionService.removeBox(vm.boxId);
                    // immediately hide the div from sight
                    angular.element('#cohort-box-container-' + vm.boxId).css('visibility', 'hidden');
                    $scope.$emit('cohortSelectionUpdateEvent');
                };

                /**
                 * Add history records (i.e. which functions to be called with what params)
                 * @param funcName - The name of the function to be called
                 * @param paramsArr - The parameters of the function
                 * @memberof CohortSelectionCtrl
                 */
                vm.addHistory = function (funcName, paramsArr) {
                    if (vm.isRecordingHistory) {
                        vm.history.push({
                            func: funcName,
                            params: paramsArr
                        });
                    }
                };

                /**
                 * reApply the history, i.e. past user interactions
                 * to the current cohort-selection box
                 * @memberof CohortSelectionCtrl
                 */
                vm.applyHistory = function () {
                    if (vm.history.length > 0) {
                        var index = 0;
                        _applyHistory(index);
                    }
                };

                function _applyHistory(index) {
                    if (index < vm.history.length) {
                        vm.isRecordingHistory = false;
                        var historyObj = vm.history[index];
                        var promise = vm[historyObj.func].apply(vm, historyObj.params);
                        if (promise) {
                            promise.then(function () {
                                index++;
                                _applyHistory(index);
                            });
                        }
                    } else {
                        vm.isRecordingHistory = true;
                    }
                }

                /**
                 * Add a node to the node collection of this cohort-selection
                 * @param node
                 * @memberof CohortSelectionCtrl
                 */
                vm.addNode = function (node) {
                    var found = _.find(vm.cs.nodes, node);
                    if (!found) {
                        vm.cs.nodes.push(node);
                    }
                };

                /**
                 * Remove a node from the node collection of this cohort-selection
                 * @param label
                 * @returns {boolean} - Indicating removal of node is successful or not
                 * @memberof CohortSelectionCtrl
                 */
                vm.removeNode = function (label) {
                    var filterOpt = {
                        label: {
                            conceptPath: label.conceptPath
                        }
                    };
                    if (label.type === 'combination') {
                        filterOpt = {
                            label: {
                                name: label.name
                            }
                        };
                    }

                    var removed = _.remove(vm.cs.nodes, filterOpt);

                    return removed.length ? true : false;
                };

                /**
                 * Apply the duplication of an existing cohort-selection
                 * @param - The box that needs to be duplicated
                 * @memberof CohortSelectionCtrl
                 */
                vm.applyDuplication = function (dupBox) {
                    var nodes = dupBox.ctrl.cs.nodes;

                    var _applyNode = function (nodes, index) {
                        var node = nodes[index];
                        //if the node exists
                        if (node) {
                            var filters = [];
                            var charts = dupBox.ctrl.cs.charts;
                            var conceptPath = node.type === 'COMBINATION' ? node.label.name : node.label.conceptPath;
                            var chart = CohortSelectionService.findChartByConceptPath(conceptPath, charts);
                            if (chart && chart.filters()) {
                                filters.push({
                                    label: conceptPath,
                                    dcFilters: chart.filters()
                                });
                            }
                            // to make sure the nodes are added sequentially
                            // add the copy of the node, because each controller needs its independent node set
                            vm.addNodeToActiveCohortSelection(_.clone(node), filters)
                                .then(function () {
                                    index++;
                                    if (index < nodes.length) {
                                        _applyNode(nodes, index);
                                    }
                                });
                        }
                    };

                    var index = 0;
                    _applyNode(nodes, index);
                };

                $scope.$watch(function () {
                    return $element.parent().width();
                }, function (newVal, oldVal) {
                    vm.boxSize = newVal;
                    if (newVal > 0 && oldVal > 0) {
                        if (newVal <= 400) {
                            vm.reSizeAndPosition();
                        }
                        else {
                            vm.rePosition();
                        }
                    }
                });

                $scope.$watch(function () {
                    return $scope.index;
                }, function (newVal, oldVal) {
                    if (!_.isEqual(newVal, oldVal)) {
                        vm.boxIndex = (+newVal + 1);
                        vm.boxName = 'Cohort-' + vm.boxIndex;
                    }
                });

                var loadedNumImages = 0;
                $scope.$on('canvasImageLoadedEvent', function (event, args) {

                    loadedNumImages++;
                    if (loadedNumImages === vm.cs.charts.length) {
                        var canvas = args.canvas,
                            imgType = args.imageType;

                        if (imgType === 'png') {
                            canvas.toBlob(function (dataBlob) {
                                saveAs(dataBlob, 'workspace.png');
                            });
                            loadedNumImages = 0;
                        }
                        else if(imgType === 'pdf') {
                            var image = new Image();
                            var width = canvas.width, height = canvas.height;
                            var imgData = canvas.toDataURL('image/png');
                            image.src = imgData;
                            image.onload = function () {
                                var pdf = new jsPDF('landscape', 'pt', [width, height]);
                                pdf.addImage(imgData, 'PNG', 0, 0, width, height, 'imageAlias', 'FAST');
                                pdf.save('workspace.pdf');
                            };

                            loadedNumImages = 0;
                        }
                    }
                });

            }]);
