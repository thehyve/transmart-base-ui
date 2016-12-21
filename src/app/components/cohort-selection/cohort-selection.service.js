'use strict'

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name CohortSelectionService
 * @description handles cohort chart creation and user-interaction
 */
angular.module('transmartBaseUi')
    .factory('CohortSelectionService', ['UtilityService', 'QueryParserService', 'ContentService', '$q',
        function (UtilityService, QueryParserService, ContentService, $q) {
            var service = {
                boxes: [],
                MAX_NUM_BOXES: 2,
                DEFAULT_BOX_SIZE: 500
            };

            service.currentBoxId = '';

            /**
             * Add box to workspace
             * @returns {Object} - The new box id
             * @memberof CohortSelectionService
             */
            service.addBox = function () {
                var deferred = $q.defer();
                var boxObj = undefined;
                var boxId = undefined;
                if (service.boxes.length < service.MAX_NUM_BOXES) {
                    boxId = UtilityService.guid();
                    service.currentBoxId = boxId;
                    boxObj = {
                        boxId: boxId,
                        //the deferred object signals resolution when the
                        //corresponding cohort-selection.directive is ready
                        deferred: deferred,
                        studyId: undefined,
                        //default ng-model value for the checkbox in cohort grid
                        checked: true
                    };
                    service.boxes.push(boxObj);

                    var boxsetContainer = angular.element('#cohort-selection-ui-layout-div');
                    var boxsetContainerWidth = boxsetContainer.width();
                    if (service.boxes.length > 2) {
                        boxsetContainerWidth += service.DEFAULT_BOX_SIZE;
                        boxsetContainer.width(boxsetContainerWidth);
                    }
                }

                return boxObj;
            };

            /**
             * Duplicate the box based the given, existing box,
             * which is identified by boxId
             * @param boxId
             * @memberof CohortSelectionService
             */
            service.duplicateBox = function (boxId) {
                var currBox = service.getBox(boxId);
                var newBox = service.addBox();
                if (currBox && newBox) {
                    newBox.duplication = currBox;
                }
            };

            /**
             * Remove box to workspace
             * @param boxId - The Id of the box to be removed
             * @returns {Boolean} - To indicate if the box to be removed is found
             * @memberof CohortSelectionService
             */
            service.removeBox = function (boxId) {
                if (service.boxes.length > 1) {
                    var removed = _.remove(service.boxes, {boxId: boxId});
                    return removed.length ? true : false;
                } else {
                    return false;
                }
            };

            /**
             * Find the box with id
             * @param boxId
             * @memberof CohortSelectionService
             * @returns {*}
             */
            service.getBox = function (boxId) {
                return _.find(service.boxes, {boxId: boxId});
            };

            /** Set the ids and classes of the cohort selection container and its main container
             * @param elm - The element of the cohort selection box
             * @param boxId - The Id of the cohort selection
             * @returns {String} - The main container Id
             * @memberof CohortSelectionService
             */
            service.setElementAttrs = function (elm, boxId) {
                /*
                 * HTML hierarchy:
                 * cohortSelectionBox
                 *      |_ btn toolbar
                 *      |_ progress container
                 *      |_ main container
                 */
                elm.attr('id', boxId);
                var children = elm.children();
                var mainContainer = null;
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    if (angular.element(child).hasClass('main-chart-container')) {
                        mainContainer = angular.element(child);
                        break;
                    }
                }
                var id = boxId + '-main-chart-container';
                if (mainContainer !== null) {
                    mainContainer.attr('id', id);
                }
                return id;
            };

            /**
             * @memberof CohortSelectionService
             * @param {String} path - conceptPath
             * @param {Array} charts - the array of charts to be searched
             * @returns {*} - The found chart in CohortSelectionCtrl.cs.charts,
             *      with matching name chartName, if not found, return null
             */
            service.findChartByConceptPath = function (path, charts) {
                var foundChart = null;
                charts.forEach(function (_chart) {
                    if (_chart.tsLabel.conceptPath === path) {
                        foundChart = _chart;
                    }
                    else if (_chart.tsLabel.type === 'combination'
                        && _chart.tsLabel.name === path) {
                        foundChart = _chart;
                    }
                });
                return foundChart;
            };

            /**
             * @memberof CohortSelectionService
             * @param value
             * @returns {string} - The type of label
             */
            service.getLabelType = function (value) {
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
             * Find the box that represents an empty workspace,
             * if not found, return undefined
             * @returns {object}
             * @memberof CohortSelectionService
             */
            service.findEmptyBox = function () {
                var foundBox = undefined;
                service.boxes.forEach(function (box) {
                    if (box.ctrl.cs.charts.length == 0) {
                        foundBox = box;
                    }
                });

                return foundBox;
            };

            /**
             * Load selected cohorts to designated workspace
             * @param selectedCohorts
             * @param box
             * @memberof CohortSelectionService
             */
            service.loadCohorts = function (selectedCohorts, box) {
                selectedCohorts.forEach(function (cohort) {
                    QueryParserService.convertCohortFiltersFromXML(cohort.queryXML, box.ctrl);
                });
                ContentService.activateTab(ContentService.tabs[0].title, 'cohortSelection');
            };

            /**
             * Check if a given node's study is the same as the one in the box,
             * if yes, return false, else return true
             * @param node
             * @param boxId
             * @returns {boolean}
             */
            service.isNodeStudyConflict = function (node, boxId) {
                var isConflict = false;
                var nodeStudyId = node.study.id;
                var box = service.getBox(boxId);
                if(nodeStudyId && box) {
                    if(!box.studyId) {
                        box.studyId = nodeStudyId;
                    }
                    else if(nodeStudyId !== box.studyId) {
                        isConflict = true;
                    }
                }
                return isConflict;
            };

            return service;
        }]);
