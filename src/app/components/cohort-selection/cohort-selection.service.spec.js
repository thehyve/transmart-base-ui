'use strict'

describe('CohortSelectionService', function () {
    var CohortSelectionService, QueryParserService, ContentService;

    beforeEach(function () {
        module('transmartBaseUi');
    });

    beforeEach(inject(function (_CohortSelectionService_, _QueryParserService_, _ContentService_) {
        CohortSelectionService = _CohortSelectionService_;
        QueryParserService = _QueryParserService_;
        ContentService = _ContentService_;
    }));

    describe('addBox', function () {

        it('should assert that CohortSelectionService.boxes is defined', function () {
            expect(CohortSelectionService.boxes).toBeDefined();
        });

        it('should assert that CohortSelectionService.boxes is an array containing only one boxId', function () {
            CohortSelectionService.addBox();
            expect(CohortSelectionService.boxes.length).toBe(1);
        });

        it('should deal with the situation when the number of boxes > 2', function () {
            CohortSelectionService.MAX_NUM_BOXES = 10;
            CohortSelectionService.addBox();
            CohortSelectionService.addBox();
            CohortSelectionService.addBox();
        });

    });

    describe('removeBox', function () {
        var newBox;

        beforeEach(function () {
            newBox = CohortSelectionService.addBox();
        });

        it('should not remove the box when there is only one left', function () {
            expect(CohortSelectionService.boxes.length).toBe(1);
            CohortSelectionService.removeBox(newBox.boxId);
            expect(CohortSelectionService.boxes.length).toBe(1);
        });

        it('should remove a box when the number of boxes is larger than one', function () {
            CohortSelectionService.addBox();
            expect(CohortSelectionService.boxes.length).toBe(2);
            CohortSelectionService.boxes.forEach(function (box) {
                box.ctrl = {
                    boxElm: angular.element('<div></div>')
                }
                box.ctrl.boxElm.parent = function () {
                    return angular.element('<div></div>');
                }
            });
            CohortSelectionService.removeBox(newBox.boxId);
            expect(CohortSelectionService.boxes.length).toBe(1);
        });

    });

    describe('findChartByConceptPath', function () {
        var chart = {
            tsLabel: {
                conceptPath: 'a/concept/path',
                type: 'numeric'
            }
        };
        var combinationChart = {
            tsLabel: {
                conceptPath: 'a/combination/concept/path',
                name: 'combi-chart',
                type: 'combination'
            }
        };
        var charts = [chart, combinationChart];

        it('should return combinationChart', function () {
            var inputPath = 'combi-chart';
            var foundChart = CohortSelectionService.findChartByConceptPath(inputPath, charts);
            expect(foundChart).toBe(combinationChart);
        });

        it('should return null if path or name does not match', function () {
            var inputPath = 'combi-chart-wrong';
            var foundChart = CohortSelectionService.findChartByConceptPath(inputPath, charts);
            expect(foundChart).toBe(null);
        });

    });

    describe('duplicateBox', function () {
        var box;
        beforeEach(function () {
            box = CohortSelectionService.addBox();
        });

        it('should perform duplication of box', function () {
            CohortSelectionService.duplicateBox(box.boxId);
        });
    });

    describe('removeBox', function () {
        var box, ctrl;
        beforeEach(function () {
            box = CohortSelectionService.addBox();
            var boxElm = {
                parent: function () {
                    return {
                        width: function () {
                            return 100;
                        }
                    }
                }
            };
            ctrl = {
                boxElm: boxElm
            };
            box.ctrl = ctrl;
        });

        it('should perform removal of box', function () {
            CohortSelectionService.addBox().ctrl = ctrl;
            CohortSelectionService.removeBox(box.boxId);
        });

        it('should adjust width when boxes.length > 2', function () {
            CohortSelectionService.MAX_NUM_BOXES = 10;
            CohortSelectionService.addBox().ctrl = ctrl;
            CohortSelectionService.addBox().ctrl = ctrl;
            CohortSelectionService.addBox().ctrl = ctrl;
            CohortSelectionService.removeBox(box.boxId);
        });

        it('should handle non-existing boxId', function () {
            CohortSelectionService.addBox().ctrl = ctrl;
            CohortSelectionService.removeBox(box.boxId + '123');
        });
    });

    describe('getLabelType', function () {
        it('should handle string values', function () {
            var val = 'E';
            var type = CohortSelectionService.getLabelType(val);
            expect(type).toBe('highdim');

            val = 'MRNA';
            type = CohortSelectionService.getLabelType(val);
            expect(type).toBe('highdim');
        });
    });

    describe('findEmptyBox', function () {
        it('should find empty box if there is one', function () {
            var emptyBox = {
                ctrl: {
                    cs: {
                        charts: []
                    }
                }
            };

            CohortSelectionService.boxes.push(emptyBox);
            var foundBox = CohortSelectionService.findEmptyBox();
            expect(foundBox).toBe(foundBox);
        });

        it('should return undefined when there is no empty box', function () {
            var nonEmptyBox = {
                ctrl: {
                    cs: {
                        charts: [{}]
                    }
                }
            };
            CohortSelectionService.boxes.push(nonEmptyBox);
            var foundBox = CohortSelectionService.findEmptyBox();
            expect(foundBox).toBe(undefined);
        });

        it('should return undefined when there is no box', function () {
            var foundBox = CohortSelectionService.findEmptyBox();
            expect(foundBox).toBe(undefined);
        });
    });

    describe('loadCohorts', function () {
        it('should load cohorts by calling QueryParserService and switching tab', function () {
            var cohorts = [{}];
            spyOn(QueryParserService, 'convertCohortFiltersFromXML');
            spyOn(ContentService, 'activateTab');
            CohortSelectionService.loadCohorts(cohorts, {});
            expect(QueryParserService.convertCohortFiltersFromXML).toHaveBeenCalled();
            expect(ContentService.activateTab).toHaveBeenCalled();
        });
    });

    describe('isNodeStudyConflict', function () {
        var node, box;
        beforeEach(function () {
            node = {
                study: {
                    id: 'studyId1'
                }
            };
            box = {
                studyId: 'studyId2'
            };

            spyOn(CohortSelectionService, 'getBox').and.callFake(function () {
                return box;
            });
        });

        it('should return true when the node study is different from that in the workspace', function () {
            var isConflict = CohortSelectionService.isNodeStudyConflict(node, '');
            expect(CohortSelectionService.getBox).toHaveBeenCalled();
            expect(isConflict).toBe(true);
        });

        it('should assign study id to workspace box when the field is undefined', function () {
            box.studyId = undefined;
            var isConflict = CohortSelectionService.isNodeStudyConflict(node, '');
            expect(box.studyId).toBe(node.study.id);
            expect(isConflict).toBe(false);
        });
    });

});
