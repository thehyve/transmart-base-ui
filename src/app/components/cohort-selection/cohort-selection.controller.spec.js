'use strict';

describe('CohortSelectionCtrl', function () {
    var $controller, AlertService, CohortSelectionService, TreeNodeService,
        DcChartsService, Restangular, CohortChartMocks, ctrl, scope, ctrlElm,
        $timeout, ContentService, CohortSelectionMocks;

    beforeEach(module('transmartBaseUi'));

    beforeEach(inject(function (_$controller_, _AlertService_, _$rootScope_, _CohortSelectionService_,
                                _DcChartsService_, _Restangular_, _CohortChartMocks_, _TreeNodeService_,
                                _$timeout_, _ContentService_, _CohortSelectionMocks_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        scope = _$rootScope_.$new();
        $controller = _$controller_;
        AlertService = _AlertService_;
        CohortSelectionService = _CohortSelectionService_;
        TreeNodeService = _TreeNodeService_;
        DcChartsService = _DcChartsService_;
        $timeout = _$timeout_;
        CohortSelectionMocks = _CohortSelectionMocks_;
        ContentService = _ContentService_;

        Restangular = angular.copy(_Restangular_, Restangular);
        CohortChartMocks = _CohortChartMocks_;
        scope.labels = CohortChartMocks.getMockLabels();
        scope.label = scope.labels[0];

        ctrlElm = angular.element('<div></div>');
        ctrl = $controller('CohortSelectionCtrl', {$scope: scope, $element: ctrlElm});
        spyOn(AlertService, 'get');
        scope.$digest();

    }));

    describe('Initialization of controller', function () {
        it('should initialize the cs object', function () {
            expect(ctrl.cs).toBeDefined();
            expect(ctrl.cs.subjects).toBeDefined();
            expect(ctrl.cs.selectedSubjects).toBeDefined();
            expect(ctrl.cs.chartId).toBeDefined();
            expect(ctrl.cs.charts).toBeDefined();
            expect(ctrl.cs.crossfilter).toBeDefined();
            expect(ctrl.cs.dimensions).toBeDefined();
            expect(ctrl.cs.maxNoOfDimensions).toBeDefined();
            expect(ctrl.cs.groups).toBeDefined();
            expect(ctrl.cs.labels).toBeDefined();
            expect(ctrl.cs.selected).toBeDefined();
            expect(ctrl.cs.total).toBeDefined();
            expect(ctrl.cs.mainDimension).toBeDefined();

        });
    });

    describe('removeLabel', function () {
        beforeEach(function () {
            var filterFunc = function (filters) {
                return filters;
            }
            ctrl.cs.charts = [
                {id: 1, filter: filterFunc},
                {id: 2, filter: filterFunc},
                {id: 3, filter: filterFunc}
            ];
            ctrl.cs.labels = [
                {labelId: 1},
                {labelId: 2},
                {labelId: 3}
            ];
        });

        it('should be able to remove a label ', function () {
            spyOn(ctrl, 'removeLabel');
            ctrl.removeLabel(scope.label);
            expect(ctrl.removeLabel).toHaveBeenCalledWith(scope.label);
        });

        it('should remove chart from charts', function () {
            var _label = {
                labelId: 2
            };
            spyOn(ctrl, 'filterSubjectsByLabel');
            spyOn(dc.chartRegistry, 'deregister');
            spyOn(ctrl, 'updateDimensions');
            ctrl.removeLabel(_label);
            expect(ctrl.cs.charts.length).toBe(2);
            expect(ctrl.cs.labels.length).toBe(2);
            expect(ctrl.filterSubjectsByLabel).toHaveBeenCalled();
            expect(dc.chartRegistry.deregister).toHaveBeenCalled();
            expect(ctrl.updateDimensions).toHaveBeenCalled();
        });

        it('should call reset when labels array is empty', function () {
            var _label = {
                labelId: 2
            };
            var filterFunc = function (filters) {
                return filters;
            };
            ctrl.cs.charts = [
                {id: 2, filter: filterFunc}
            ];
            ctrl.cs.labels = [
                {labelId: 2}
            ];

            spyOn(ctrl, 'filterSubjectsByLabel');
            spyOn(dc.chartRegistry, 'deregister');
            ctrl.removeLabel(_label);
            expect(ctrl.cs.charts.length).toBe(0);
            expect(ctrl.cs.labels.length).toBe(0);
            expect(ctrl.filterSubjectsByLabel).toHaveBeenCalled();
            expect(dc.chartRegistry.deregister).toHaveBeenCalled();
        });

        it('should defer rejection when label is undefined', function () {
            ctrl.removeLabel(undefined);
        });
    });

    describe('clearSelection', function () {
        it('should be able to clear the current cohort selection', function () {
            spyOn(ctrl, 'reset');
            spyOn(ctrl, 'updateDimensions');

            ctrl.clearSelection();
            expect(ctrl.reset).toHaveBeenCalled();
            expect(ctrl.updateDimensions).toHaveBeenCalled();
        });
    });

    describe('addNodeWithFilters', function () {
        var node = {},
            chartName = "parent/restobj/fullname",
            dcFilters = [['category1'], ['category2']];

        beforeEach(function () {
            node.type = '';
            node.restObj = {};
            node.restObj.fullName = chartName;
        });

        it('should invoke addNodeToActiveCohortSelection when a cohort filter is added', function () {
            var filters = [{
                label: 'parent/restobj/fullname',
                dcFilters: dcFilters
            }];

            spyOn(ctrl, 'addNodeWithFilters').and.callThrough();
            spyOn(ctrl, 'addNodeToActiveCohortSelection');
            ctrl.addNodeWithFilters(node, dcFilters)
            expect(ctrl.addNodeWithFilters).toHaveBeenCalledWith(node, dcFilters);
            expect(ctrl.addNodeToActiveCohortSelection).toHaveBeenCalledWith(node, filters);
        });
    });

    describe('onNodeDrop', function () {
        var pieNode = {}, node = {},
            chart = {
                filter: function (word) {
                },
                render: function () {
                }
            },
            chartName = "parent/restobj/fullname";

        var event = {};
        event.target = '<div class="chart-container-hover"></div>';
        var info = {};

        beforeEach(function () {
            pieNode.type = 'CATEGORICAL_OPTION';
            pieNode.parent = node;
            pieNode.study = {
                id: 'a-study'
            };

            node.type = '';
            node.restObj = {};
            node.restObj.fullName = chartName;

            ctrl.cs = {};
            ctrl.cs.charts = [];
        });

        it('should invoke addNodeToActiveCohortSelection when a pieNode is newly dropped', function () {
            var filters = [{
                label: 'parent/restobj/fullname',
                dcFilters: [undefined]
            }];

            spyOn(ctrl, 'onNodeDrop').and.callThrough();
            spyOn(ctrl, 'addNodeToActiveCohortSelection');
            spyOn(CohortSelectionService, 'isNodeStudyConflict').and.callFake(function () {
                return false;
            });
            ctrl.onNodeDrop(event, info, pieNode);
            expect(CohortSelectionService.isNodeStudyConflict).toHaveBeenCalled();
            expect(ctrl.onNodeDrop).toHaveBeenCalledWith(event, info, pieNode);
            expect(ctrl.addNodeToActiveCohortSelection).toHaveBeenCalledWith(node, filters);
        });

        it('should not invoke addNodeToActiveCohortSelection upon node-dropping when the pie-chart exists', function () {
            chart.tsLabel = {};
            chart.tsLabel.label = chartName;
            chart.tsLabel.conceptPath = chartName;
            chart.filters = function () {
                return [];
            };
            ctrl.cs.charts.push(chart);

            spyOn(ctrl, 'onNodeDrop').and.callThrough();
            spyOn(ctrl, 'addNodeToActiveCohortSelection');
            spyOn(ctrl, 'updateDimensions');

            ctrl.onNodeDrop(event, info, pieNode);
            expect(ctrl.onNodeDrop).toHaveBeenCalledWith(event, info, pieNode);
            expect(ctrl.addNodeToActiveCohortSelection).not.toHaveBeenCalled();
        });

        it('should invoke addNodeToActiveCohortSelection with node when the node is dropped', function () {
            spyOn(ctrl, 'onNodeDrop').and.callThrough();
            spyOn(ctrl, 'addNodeToActiveCohortSelection');
            spyOn(CohortSelectionService, 'isNodeStudyConflict').and.callFake(function () {
                return false;
            });

            ctrl.onNodeDrop(event, info, node);
            expect(CohortSelectionService.isNodeStudyConflict).toHaveBeenCalled();
            expect(ctrl.onNodeDrop).toHaveBeenCalledWith(event, info, node);
            expect(ctrl.addNodeToActiveCohortSelection).toHaveBeenCalled();
        });

        it('should act on a node drop event', function () {
            var nodes = CohortChartMocks.getNodes();
            var dropEvent = CohortChartMocks.getDropEvent();

            spyOn(ctrl, 'onNodeDrop');
            angular.element(dropEvent.target).addClass('chart-container-hover');
            ctrl.onNodeDrop(dropEvent, {}, nodes);
            expect(ctrl.onNodeDrop).toHaveBeenCalledWith(dropEvent, {}, nodes);
            expect(!angular.element(dropEvent.target).hasClass('chart-container-hover'));
        });

        it('should alert the user when different studies get mixed', function () {
            spyOn(CohortSelectionService, 'isNodeStudyConflict').and.callFake(function () {
                return true;
            });
            spyOn(CohortSelectionService, 'getBox').and.callFake(function () {
                return {studyId: ''};
            });
            spyOn(AlertService, 'add');
            ctrl.onNodeDrop({}, '', pieNode);
            expect(CohortSelectionService.isNodeStudyConflict).toHaveBeenCalled();
            expect(CohortSelectionService.getBox).toHaveBeenCalled();
            expect(AlertService.add).toHaveBeenCalled();

        });
    });

    describe('restoreCrossfilter', function () {
        var fullSubjects = [
            {
                id: 1, gender: 'male'
            },
            {
                id: 2, gender: 'female'
            },
            {
                id: 3, gender: 'male'
            },
            {
                id: 4, gender: 'female'
            },
            {
                id: 5, gender: 'unknown'
            }
        ];

        var partialSubjects = [
            {
                id: 1, gender: 'male'
            },
            {
                id: 2, gender: 'female'
            },
            {
                id: 5, gender: 'unknown'
            }
        ];

        it('should restore the crossfilter dimension(s)', function () {
            ctrl.cs.crossfilter = crossfilter(partialSubjects);
            var dimChanged = ctrl.cs.crossfilter.dimension(function (d) {
                return d.gender;
            });
            expect(dimChanged.top(Infinity).length).toEqual(3);

            var restorationPerformed = ctrl.restoreCrossfilter();
            expect(restorationPerformed).toEqual(false);

            ctrl.cs.subjects = fullSubjects;
            restorationPerformed = ctrl.restoreCrossfilter();
            var dimRestored = ctrl.cs.crossfilter.dimension(function (d) {
                return d.gender;
            });
            expect(restorationPerformed).toEqual(true);
            expect(dimRestored.top(Infinity).length).toEqual(5);
        });
    });

    describe('filterSubjectsByLabel', function () {
        var _subjects, _label, _labelNo;

        beforeEach(function () {
            _subjects = [
                {
                    subject: 1,
                    observations: {
                        label1: 'label1',
                        label2: 'label2',
                        label3: 'label3'
                    }

                },
                {
                    subject: 2,
                    observations: {
                        label1: 'label1'
                    }
                }
            ];
            _label = {labelId: 0, conceptPath: 'label1'};
            _labelNo = {labelId: 99, conceptPath: 'label99'};
        });

        it('should remove label from subject labels', function () {
            var _res = ctrl.filterSubjectsByLabel(_subjects, _label);
            expect(_res[0].observations['label1']).not.toBeDefined();
        });

        it('should not remove any subject observations if label does not exist in any subject observations',
            function () {
                var _res = ctrl.filterSubjectsByLabel(_subjects, _labelNo);
                expect(_res[0].observations['label1']).toBeDefined();
                expect(_res[0].observations['label2']).toBeDefined();
                expect(_res[0].observations['label3']).toBeDefined();
                expect(_res[1].observations['label1']).toBeDefined();
            });

    });

    describe('clearChartFilterByLabel', function () {
        var _charts, _label, _labelNotExist, _filter = function (x) {
        };

        beforeEach(function () {
            var boxId = ctrl.boxId;
            ctrl.reset();
            _charts = [
                {id: 0, filter: _filter},
                {id: 1, filter: _filter},
                {id: 2, filter: _filter}
            ];
            _label = {labelId: 2, boxId: boxId};
            _labelNotExist = {labelId: 3, boxId: boxId};

            ctrl.cs.charts = _charts;

            spyOn(ctrl, 'updateDimensions');
        });

        it('should return undefined when label does not match with the charts', function () {
            var _res = ctrl.clearChartFilterByLabel(_labelNotExist);
            expect(_res).toEqual(undefined);
        });

        it('should clear filter on a chart by given label', function () {
            spyOn(_charts[2], 'filter');
            ctrl.clearChartFilterByLabel(_label);
            expect(_charts[2].filter).toHaveBeenCalledWith(null);
        });

        it('should invoke dc.redrawAll', function () {
            spyOn(dc, 'redrawAll');
            ctrl.clearChartFilterByLabel(_label);
            expect(dc.redrawAll).toHaveBeenCalled();
        });

        it('should invoke updateDimensions', function () {
            ctrl.clearChartFilterByLabel(_label);
            expect(ctrl.updateDimensions).toHaveBeenCalled();
        });

    });

    describe('addNodeToActiveCohortSelection', function () {
        var node = {};
        var childNode = {};

        beforeEach(function () {
            node.restObj = Restangular;
            node.restObj._links = {
                children: undefined
            };
            node.nodes = [];
            node.observations = [{
                value: ''
            }];

            childNode.observations = [{
                value: ''
            }];

        });

        it('should try to retrieve child nodes when node.nodes = []', function () {
            spyOn(TreeNodeService, 'getNodeChildren').and.callThrough();
            ctrl.addNodeToActiveCohortSelection(node, []);

            expect(TreeNodeService.getNodeChildren).toHaveBeenCalledWith(node);
        });

        it('should call addNode and iterate over observations when ' +
            'node.nodes is empty and has categorical leaf child nodes', function () {
            TreeNodeService.getNodeChildren = function (_node) {
                return {
                    then: function (func) {
                        func();
                    }
                }
            };
            TreeNodeService.isCategoricalLeafNode = function (_node) {
                return true;
            };

            spyOn(ctrl, 'addNode');
            spyOn(node.observations, 'forEach');
            ctrl.addNodeToActiveCohortSelection(node, []);
            expect(ctrl.addNode).toHaveBeenCalledWith(node);
            expect(node.observations.forEach).toHaveBeenCalled();
        });

        it('should call addNode and iterate over observations when ' +
            'node.nodes is non-empty and has categorical leaf child nodes', function () {
            node.nodes = [{
                id: 'aNode'
            }];
            TreeNodeService.isCategoricalLeafNode = function (_node) {
                return true;
            };

            spyOn(ctrl, 'addNode');
            spyOn(node.observations, 'forEach');
            ctrl.addNodeToActiveCohortSelection(node, []);
            expect(ctrl.addNode).toHaveBeenCalledWith(node);
            expect(node.observations.forEach).toHaveBeenCalled();
        });

        it('should iterate over child nodes, call addNode, and iterate over child observations ' +
            'when node.nodes is non-empty and has no categorical leaf child node', function () {
            node.nodes = [childNode];
            TreeNodeService.isCategoricalLeafNode = function (_node) {
                return false;
            };

            spyOn(node.nodes, 'forEach').and.callThrough();
            spyOn(ctrl, 'addNode');
            spyOn(childNode.observations, 'forEach');
            ctrl.addNodeToActiveCohortSelection(node, []);
            expect(node.nodes.forEach).toHaveBeenCalled();
            expect(ctrl.addNode).toHaveBeenCalledWith(childNode);
            expect(childNode.observations.forEach).toHaveBeenCalled();
        });

        it('should accept combination node', function () {
            var node = {type: 'COMBINATION'};
            spyOn(ctrl, 'combineCharts');
            ctrl.addNodeToActiveCohortSelection(node, []);
            expect(ctrl.combineCharts).toHaveBeenCalled();
        });

    });


    describe('resetCharts', function () {
        var chart1, chart2;
        beforeEach(function () {
            ctrl.cs.charts = [];
            chart1 = {
                id: 'c1',
                filter: function () {
                }
            }
            chart2 = {
                id: 'c2',
                filter: function () {
                }
            }
            ctrl.cs.charts.push(chart1);
            ctrl.cs.charts.push(chart2);
            spyOn(chart1, 'filter');
            spyOn(chart2, 'filter');
            spyOn(ctrl, 'updateDimensions');
            spyOn(ctrl, 'reSizeAndPosition');
            spyOn(dc, 'redrawAll');

            ctrl.resetCharts();
        });

        it('should clear the filters of the charts', function () {
            expect(chart1.filter).toHaveBeenCalledWith(null);
            expect(chart2.filter).toHaveBeenCalledWith(null);
        });

        it('should update dimensions and reSizeAndPosition charts', function () {
            expect(ctrl.updateDimensions).toHaveBeenCalled();
            expect(ctrl.reSizeAndPosition).toHaveBeenCalled();
            expect(dc.redrawAll).toHaveBeenCalled();
        });
    });

    describe('applyDuplication', function () {
        var chart = {
            tsLabel: {
                conceptPath: 'concept/path'
            }
        }
        var node = {
            restObj: {
                fulllName: 'concept/path'
            },
            label: {
                name: 'aLabelName',
                conceptPath: 'a/concept/path'
            }
        }
        var dupBox = {
            ctrl: {
                cs: {
                    nodes: [],
                    charts: []
                }
            }
        }

        it('should call addNodeToActiveCohortSelection', function () {
            dupBox.ctrl.cs.nodes.push(node);
            spyOn(ctrl, 'addNodeToActiveCohortSelection').and.callFake(function () {
                return {
                    then: function () {
                    }
                }
            });
            ctrl.applyDuplication(dupBox);
            expect(ctrl.addNodeToActiveCohortSelection).toHaveBeenCalled();
        });

        it('should call findChartByConceptPath', function () {
            dupBox.ctrl.cs.nodes.push(node);
            spyOn(ctrl, 'addNodeToActiveCohortSelection').and.callFake(function () {
                return {
                    then: function () {
                    }
                }
            });
            spyOn(CohortSelectionService, 'findChartByConceptPath');
            ctrl.applyDuplication(dupBox);
            expect(CohortSelectionService.findChartByConceptPath).toHaveBeenCalled();
        });

    });

    describe('addNode', function () {

        beforeEach(function () {
            ctrl.cs = {
                nodes: []
            }
        });

        it('should add node when it is not already existent', function () {
            expect(ctrl.cs.nodes.length).toBe(0);
            var node = {id: 'a_node'};
            ctrl.addNode(node);
            expect(ctrl.cs.nodes.length).toBe(1);
        });

        it('should not add node when it exits', function () {
            ctrl.cs.nodes.push({
                id: 'a_node'
            });
            var node = {id: 'a_node'};
            ctrl.addNode(node);
            expect(ctrl.cs.nodes.length).toBe(1);
        });
    });

    describe('removeNode', function () {
        beforeEach(function () {
            ctrl.cs = {
                nodes: []
            }
        });

        it('should remove node when it exists', function () {
            var node = {
                id: 'a_node',
                restObj: {
                    fullName: 'a_node_fullname'
                },
                label: {
                    name: 'aLabelName',
                    conceptPath: 'a/concept/path'
                }
            };
            var label = {
                conceptPath: 'a/concept/path'
            };
            ctrl.cs.nodes.push(node);
            expect(ctrl.cs.nodes.length).toBe(1);
            var result = ctrl.removeNode(label);
            expect(result).toBe(true);
            expect(ctrl.cs.nodes.length).toBe(0);
        });
    });

    describe('reSizeAndPosition', function () {
        beforeEach(function () {
            ctrl.cs.labels = [
                {
                    conceptPath: 'a/path/1',
                    sizeX: 2,
                    sizeY: 2
                },
                {
                    conceptPath: 'a/path/2',
                }
            ];
        });

        it('should reSizeAndPosition only when there are labels', function () {
            spyOn(_, 'sortBy').and.callFake(function () {
                return ctrl.cs.labels;
            });
            spyOn(ctrl.cs.labels, 'forEach');
            spyOn(Math, 'floor');
            ctrl.reSizeAndPosition();
            expect(_.sortBy).toHaveBeenCalled();
            expect(ctrl.cs.labels.forEach).toHaveBeenCalled();
            expect(Math.floor).toHaveBeenCalled();
        });

        it('should not reSizeAndPosition when there is no label', function () {
            ctrl.cs.labels = [];
            spyOn(ctrl.cs.labels, 'forEach');
            spyOn(Math, 'floor');
            ctrl.reSizeAndPosition();
            expect(ctrl.cs.labels.forEach).not.toHaveBeenCalled();
            expect(Math.floor).not.toHaveBeenCalled();
        });

        it('should reset sizeX and sizeY of a label', function () {
            spyOn(_, 'sortBy').and.callFake(function () {
                return ctrl.cs.labels;
            });
            spyOn(ctrl.cs.labels, 'forEach').and.callThrough();
            ctrl.reSizeAndPosition();
            expect(_.sortBy).toHaveBeenCalled();
            expect(ctrl.cs.labels[0].sizeX).toBe(1);
            expect(ctrl.cs.labels[0].sizeY).toBe(1);
            expect(ctrl.cs.labels[1].sizeX).toBe(1);
            expect(ctrl.cs.labels[1].sizeY).toBe(1);
            expect(ctrl.cs.labels.forEach).toHaveBeenCalled();
        });

    });

    describe('rePosition', function () {
        beforeEach(function () {
            ctrl.cs.labels = [
                {
                    conceptPath: 'a/path/1',
                    sizeX: 2,
                    sizeY: 2
                },
                {
                    conceptPath: 'a/path/2',
                }
            ];
        });

        it('should rePosition only when there are labels', function () {
            spyOn(_, 'sortBy').and.callFake(function () {
                return ctrl.cs.labels;
            });
            spyOn(ctrl.cs.labels, 'forEach');
            spyOn(Math, 'floor');
            ctrl.rePosition();
            expect(_.sortBy).toHaveBeenCalled();
            expect(ctrl.cs.labels.forEach).toHaveBeenCalled();
            expect(Math.floor).toHaveBeenCalled();
        });

        it('should not rePosition when there is no label', function () {
            ctrl.cs.labels = [];
            spyOn(ctrl.cs.labels, 'forEach');
            spyOn(Math, 'floor');
            ctrl.rePosition();
            expect(ctrl.cs.labels.forEach).not.toHaveBeenCalled();
            expect(Math.floor).not.toHaveBeenCalled();
        });

        it('should not reset sizeX and sizeY of an existing label', function () {
            ctrl.rePosition();
            expect(ctrl.cs.labels[0].sizeX).toBe(2);
            expect(ctrl.cs.labels[0].sizeY).toBe(2);
            expect(ctrl.cs.labels[1].sizeX).toBe(1);
            expect(ctrl.cs.labels[1].sizeY).toBe(1);
        });
    });


    describe('reOrganize', function () {
        beforeEach(function () {
            ctrl.cs.labels = [
                {
                    conceptPath: 'a/path/1',
                    sizeX: 2,
                    sizeY: 2
                },
                {
                    conceptPath: 'a/path/2',
                }
            ];
        });

        it('should reOrganize only when there are labels', function () {
            spyOn(ctrl.cs.labels, 'forEach');
            spyOn(Math, 'floor');
            ctrl.reOrganize();
            expect(ctrl.cs.labels.forEach).toHaveBeenCalled();
            expect(Math.floor).toHaveBeenCalled();
        });


        it('should not reOrganize when there is no label', function () {
            ctrl.cs.labels = [];
            spyOn(ctrl.cs.labels, 'forEach');
            spyOn(Math, 'floor');
            ctrl.reOrganize();
            expect(ctrl.cs.labels.forEach).not.toHaveBeenCalled();
            expect(Math.floor).not.toHaveBeenCalled();
        });

        it('should not reset sizeX and sizeY of an existing label', function () {
            ctrl.reOrganize();
            expect(ctrl.cs.labels[0].sizeX).toBe(2);
            expect(ctrl.cs.labels[0].sizeY).toBe(2);
            expect(ctrl.cs.labels[1].sizeX).toBe(1);
            expect(ctrl.cs.labels[1].sizeY).toBe(1);
        });
    });

    describe('createCohortChart', function () {
        var label, el, subjects;

        beforeEach(function () {
            label = {
                $$hashKey: "object:306",
                col: 0,
                row: 0,
                filter: undefined,
                label: "/Public Studies/AAA_TRANSLOCATION/Gender/",
                labelId: 0,
                name: "Gender",
                resolved: false,
                sizeX: 3,
                sizeY: 3,
                type: "string",
                boxId: ctrl.boxId
            };
            el = document.createElement('div');
            subjects = [{
                id: 1, gender: 'male', labels: {}
            }, {
                id: 2, gender: 'female', labels: {}
            }, {
                id: 3, gender: 'male', labels: {}
            }, {
                id: 4, gender: 'female', labels: {}
            }, {
                id: 5, gender: 'unknown', labels: {}
            }];

        });

        it('should create combination chart', function () {
            label.type = 'combination';
            spyOn(ctrl, 'createMultidimensionalChart').and.callFake(function () {
                return {
                    render: function () {
                    }
                }
            });
            ctrl.createCohortChart(label, el);
            expect(ctrl.createMultidimensionalChart).toHaveBeenCalled();
        });

        it('should create high dimensional chart', function () {
            label.type = 'highdim';
            spyOn(DcChartsService, 'getNumDisplay').and.callFake(function () {
                return {
                    render: function () {
                    }
                }
            });
            var chart = ctrl.createCohortChart(label, el);
            expect(DcChartsService.getNumDisplay).toHaveBeenCalled();
            expect(chart.type).toBe('NUMBER');
            expect(chart.id).toBe(label.labelId);
            expect(chart.tsLabel).toBe(label);
            expect(chart.el).toBe(el);
        });

        it('should create pie chart', function () {
            label.type = 'string';
            spyOn(DcChartsService, 'getPieChart').and.callFake(function () {
                return {
                    render: function () {
                    }
                }
            });
            var chart = ctrl.createCohortChart(label, el);
            expect(DcChartsService.getPieChart).toHaveBeenCalled();
            expect(chart.type).toBe('PIECHART');
        });

        it('should create bar chart if lable.type is number', function () {
            label.type = 'number';
            spyOn(DcChartsService, 'getBarChart').and.callFake(function () {
                return {
                    render: function () {
                    }
                }
            });
            var chart = ctrl.createCohortChart(label, el);
            expect(DcChartsService.getBarChart).toHaveBeenCalled();
            expect(chart.type).toBe('BARCHART');
        });

        it('should create bar chart if lable.type is float', function () {
            label.type = 'float';
            spyOn(DcChartsService, 'getBarChart').and.callFake(function () {
                return {
                    render: function () {
                    }
                }
            });
            var chart = ctrl.createCohortChart(label, el);
            expect(DcChartsService.getBarChart).toHaveBeenCalled();
            expect(chart.type).toBe('BARCHART');
        });

        it('should add new chart to the cs.charts array', function () {
            spyOn(DcChartsService, 'getBarChart').and.callFake(function () {
                return {
                    render: function () {
                    }
                }
            });
            var chart = ctrl.createCohortChart(label, el);
            expect(ctrl.cs.charts.length).toBe(1);
            expect(ctrl.cs.charts[0]).toBe(chart);
        });

        it('should filter the chart when label.filters is present', function () {
            var chart = {
                render: function () {
                }
            };
            label.filters = [];
            spyOn(DcChartsService, 'getBarChart').and.callFake(function () {
                return chart;
            });
            spyOn(ctrl, 'filterChart');
            ctrl.createCohortChart(label, el);
            expect(ctrl.filterChart).toHaveBeenCalled();
        });

    });

    describe('restoreCrossfilter', function () {

        it('should not restore crossfilter when subjects is empty', function () {
            ctrl.cs.subjects = [];
            var restored = ctrl.restoreCrossfilter();
            expect(restored).toBe(false);
        });

        it('should restore crossfilter when there is subjects', function () {
            ctrl.cs.subjects = [{
                id: 1, gender: 'male', labels: {}
            }, {
                id: 2, gender: 'female', labels: {}
            }, {
                id: 3, gender: 'male', labels: {}
            }];
            var restored = ctrl.restoreCrossfilter();
            expect(restored).toBe(true);
        });
    });

    describe('updateDimensions', function () {
        it('should update dimensions', function () {
            spyOn(ctrl.cs.crossfilter, 'groupAll').and.callThrough();
            spyOn(ctrl.cs.mainDimension, 'top');
            ctrl.updateDimensions();
            expect(ctrl.cs.crossfilter.groupAll).toHaveBeenCalled();
            expect(ctrl.cs.mainDimension.top).toHaveBeenCalled();
        });
    });

    describe('scope.watch', function () {

        it('should emit cohortSelectionUpdateEvent when ctrl.cs is changed', function () {
            spyOn(scope, '$emit');
            ctrl.reset();
            scope.$digest();
            expect(scope.$emit).toHaveBeenCalledWith('cohortSelectionUpdateEvent');
        });

        it('should call reSizeAndPosition when newVal and oldVal are positive', function () {
            var parentObj = {
                _width: 200,
                width: function (w) {
                    if (w) parentObj._width = w;
                    else return parentObj._width;
                }
            };
            ctrlElm.parent = function () {
                return parentObj;
            };
            scope.$digest();
            ctrlElm.parent().width(300);
            spyOn(ctrl, 'reSizeAndPosition');
            scope.$digest();
            expect(ctrl.reSizeAndPosition).toHaveBeenCalled();
        });

        it('should call rePosition when newVal is larger than 400', function () {
            var parentObj = {
                _width: 200,
                width: function (w) {
                    if (w) parentObj._width = w;
                    else return parentObj._width;
                }
            };
            ctrlElm.parent = function () {
                return parentObj;
            };
            scope.$digest();
            ctrlElm.parent().width(401);
            spyOn(ctrl, 'rePosition');
            scope.$digest();
            expect(ctrl.rePosition).toHaveBeenCalled();
        });

        it('should call rePosition when newVal is larger than 400', function () {
            scope.index = 0;
            scope.$digest();
            expect(ctrl.boxIndex).toEqual(1);
            expect(ctrl.boxName).toBe('Cohort-' + ctrl.boxIndex);
        });
    });

    describe('createMultidimensionalChart', function () {
        var genderNode, genderLabel,
            raceNode, raceLabel,
            lengthNode, lengthLabel,
            genderLengthLabel, lengthAgeLabel,
            genderRaceLabel,
            el;

        beforeEach(function () {
            el = document.createElement('div');
            ctrl.reset();

            spyOn(CohortSelectionService, 'isNodeStudyConflict').and.callFake(function () {
                return false;
            });

            genderNode = CohortSelectionMocks.getGenderNode();
            genderLabel = _.clone(genderNode.label);
            ctrl.cs.labels.push(genderLabel);
            ctrl.onNodeDrop({}, {}, genderNode);
            ctrl.createCohortChart(genderLabel, el);

            lengthNode = CohortSelectionMocks.getLengthNode();
            lengthLabel = _.clone(lengthNode.label);
            ctrl.cs.labels.push(lengthNode.label);
            ctrl.onNodeDrop({}, {}, lengthNode);
            ctrl.createCohortChart(lengthLabel, el);

            raceNode = CohortSelectionMocks.getRaceNode();
            raceLabel = _.clone(raceNode.label);
            ctrl.cs.labels.push(raceLabel);
            ctrl.onNodeDrop({}, {}, raceNode);
            ctrl.createCohortChart(raceLabel, el);

            genderLengthLabel = CohortSelectionMocks.getGenderLengthLabel();
            genderRaceLabel = CohortSelectionMocks.getGenderRaceLabel();
            lengthAgeLabel = CohortSelectionMocks.getLengthAgeLabel();

        });

        it('should create boxplot for one string and one numeric label', function () {
            ctrl.createMultidimensionalChart(genderLengthLabel, el);
        });

        it('should create heatmap for both string labels', function () {
            ctrl.createMultidimensionalChart(genderRaceLabel, el);
        });

        it('should create scatterplot for both numeric labels', function () {
            ctrl.createMultidimensionalChart(lengthAgeLabel, el);
        });

    });

    describe('onNodeOver', function () {
        var event;
        var targetElm;

        beforeEach(function () {
            targetElm = angular.element('<div></div>');
            event = {
                target: targetElm
            };
        });

        it('should add class chart-container-hover', function () {
            ctrl.onNodeOver(event);
            var hasIt = targetElm.hasClass('chart-container-hover');
            expect(hasIt).toBe(true);
        });
    });

    describe('onNodeOut', function () {
        var event;
        var targetElm;

        beforeEach(function () {
            targetElm = angular.element('<div class="chart-container-hover"></div>');
            event = {
                target: targetElm
            };
        });

        it('should remove class chart-container-hover', function () {
            ctrl.onNodeOut(event);
            var hasIt = targetElm.hasClass('chart-container-hover');
            expect(hasIt).toBe(false);
        });
    });

    describe('box operations', function () {
        it('should call perform box-adding tasks', function () {
            spyOn(CohortSelectionService, 'addBox');
            ctrl.addBox();
            expect(CohortSelectionService.addBox).toHaveBeenCalled();
        });

        it('should call perform box-removal tasks', function () {
            spyOn(ctrl, 'clearSelection');
            spyOn(CohortSelectionService, 'removeBox');
            ctrl.removeBox();
            expect(ctrl.clearSelection).toHaveBeenCalled();
            expect(CohortSelectionService.removeBox).toHaveBeenCalled();
        });

        it('should call perform box-duplicating tasks', function () {
            spyOn(CohortSelectionService, 'duplicateBox');
            ctrl.duplicateBox();
            expect(CohortSelectionService.duplicateBox).toHaveBeenCalled();
        });
    });

    describe('switchToSavedCohortsTab', function () {
        it('should switch to saved-cohorts tab', function () {
            spyOn(ContentService, 'activateTab');
            ctrl.switchToSavedCohortsTab();
            expect(ContentService.activateTab)
                .toHaveBeenCalledWith(ContentService.tabs[2].title, 'cohortView');
        });
    });

    describe('openSaveCohortModal', function () {
        it('should be able to open cohort modal', function () {
            ctrl.openSaveCohortModal();
        });
    });

    describe('getCohortFilters', function () {

        it('should get the cohort filters based on existing charts', function () {
            spyOn(CohortSelectionService, 'isNodeStudyConflict').and.callFake(function () {
                return false;
            });
            ctrl.reset();
            var el = document.createElement('div');
            var genderNode = CohortSelectionMocks.getGenderNode();
            var genderLabel = _.clone(genderNode.label);
            ctrl.cs.labels.push(genderLabel);
            ctrl.onNodeDrop({}, {}, genderNode);

            ctrl.createCohortChart(genderLabel, el);
            var filters = ctrl.getCohortFilters();
            expect(filters.length).toBe(1);
            expect(CohortSelectionService.isNodeStudyConflict).toHaveBeenCalled();
        });
    });

    describe('addNodeWithFilters', function () {

        beforeEach(function () {
            ctrl.reset();
            spyOn(ctrl, 'addNodeToActiveCohortSelection').and.callFake(function () {
                return {};
            });
        });

        it('should accept categorical parent node', function () {
            var genderNode = CohortSelectionMocks.getGenderNode();
            ctrl.addNodeWithFilters(genderNode, []);
        });

        it('should accept categorical leaf node', function () {
            var genderLeafNode = CohortSelectionMocks.getGenderLeafNode();
            ctrl.addNodeWithFilters(genderLeafNode, []);
        });
    });

    describe('combineCharts', function () {
        var chart1, chart2;

        beforeEach(function () {
            spyOn(CohortSelectionService, 'isNodeStudyConflict').and.callFake(function () {
                return false;
            });
            var el = document.createElement('div');
            var genderNode = CohortSelectionMocks.getGenderNode();
            var genderLabel = _.clone(genderNode.label);
            ctrl.cs.labels.push(genderLabel);
            ctrl.onNodeDrop({}, {}, genderNode);
            ctrl.createCohortChart(genderLabel, el);

            var lengthNode = CohortSelectionMocks.getLengthNode();
            var lengthLabel = _.clone(lengthNode.label);
            ctrl.cs.labels.push(lengthNode.label);
            ctrl.onNodeDrop({}, {}, lengthNode);
            ctrl.createCohortChart(lengthLabel, el);

            chart1 = ctrl.cs.charts[0];
            chart2 = ctrl.cs.charts[1];
            expect(CohortSelectionService.isNodeStudyConflict).toHaveBeenCalled();
        });

        it('should call combineCharts when filterObj is undefined', function () {
            ctrl.combineCharts(chart1, chart2, undefined);
        });

        it('should call combineCharts when filterObj is defined', function () {
            var filterObj = {
                dcFilters: {}
            };
            ctrl.combineCharts(chart1, chart2, filterObj);
        });
    });

    describe('groupCharts', function () {

        beforeEach(function () {
            spyOn(CohortSelectionService, 'isNodeStudyConflict').and.callFake(function () {
                return false;
            });
            var el = document.createElement('div');
            var genderNode = CohortSelectionMocks.getGenderNode();
            var genderLabel = _.clone(genderNode.label);
            ctrl.cs.labels.push(genderLabel);
            ctrl.onNodeDrop({}, {}, genderNode);
            ctrl.createCohortChart(genderLabel, el);

            var ageNode = CohortSelectionMocks.getAgeNode();
            var ageLabel = _.clone(ageNode.label);
            ctrl.cs.labels.push(ageLabel);
            ctrl.onNodeDrop({}, {}, ageNode);
            ctrl.createCohortChart(ageLabel, el);
            expect(CohortSelectionService.isNodeStudyConflict).toHaveBeenCalled();
        });

        it('should call perform chart grouping when ctrl.currentChartGrouping is {}', function () {
            ctrl.groupCharts(ctrl.cs.charts[0], {});
        });

        it('should perform chart grouping when ctrl.currentChartGrouping has chartOne', function () {
            var func = function () {
            };
            ctrl.currentChartGrouping = {
                chartOne: ctrl.cs.charts[0],
                turnOff: func
            };
            ctrl.groupCharts(ctrl.cs.charts[1], func);
        });
    });

    describe('addLabel', function () {
        var genderNode;
        var ageNode;

        beforeEach(function () {
            genderNode = CohortSelectionMocks.getGenderNode();
            ageNode = CohortSelectionMocks.getAgeNode();
        });

        it('should add label when it has not been added before', function () {
            ctrl.addLabel(genderNode.observations[0], genderNode, {});
        });

        it('should give alert when the number of labels exceeds max', function () {
            _.times(ctrl.cs.maxNoOfDimensions + 1, function () {
                ctrl.cs.labels.push(ageNode.label);
            });
            ctrl.addLabel(genderNode.observations[0], genderNode, {});
        });

        it('should calculate precision when label.type is float ', function () {
            ctrl.addLabel(ageNode.observations[0], ageNode, {});
        });
    });

    describe('handling canvasImageLoadedEvent', function () {

        it('should handle canvasImageLoadedEvent with png export', function () {
            ctrl.cs.charts = [
                {}
            ];
            var canvas = {
                toBlob: function () {
                }
            };
            spyOn(canvas, 'toBlob');
            var imgType = 'png';
            var args = {
                canvas: canvas,
                imageType: imgType
            };
            for (var i = 0; i < ctrl.cs.charts.length; i++) {
                scope.$emit('canvasImageLoadedEvent', args);
            }
            expect(canvas.toBlob).toHaveBeenCalled();
        });

        it('should handle canvasImageLoadedEvent with pdf export', function () {
            ctrl.cs.charts = [
                {}
            ];
            var canvas = {
                width: 200,
                height: 200,
                toDataURL: function () {
                }
            };
            spyOn(canvas, 'toDataURL');
            var imgType = 'pdf';
            var args = {
                canvas: canvas,
                imageType: imgType
            };
            for (var i = 0; i < ctrl.cs.charts.length; i++) {
                scope.$emit('canvasImageLoadedEvent', args);
            }
            expect(canvas.toDataURL).toHaveBeenCalled();
        });
    });

});
