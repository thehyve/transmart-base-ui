'use strict';

describe('Unit testing cohort-chart directive', function () {
    var ctrl, $controller, $compile, rootScope, scope, chartElm, AlertService,
        CohortChartMocks, CohortSelectionMocks, CohortSelectionService, DcChartsService;

    // Load the transmartBaseUi module, which contains the directive
    beforeEach(function () {
        module('transmartBaseUi');
    });
    // load all angular templates (a.k.a html files)
    beforeEach(module('transmartBaseUIHTML'));

    // Store references to $rootScope and $compile
    // so they are available to all tests in this describe block
    beforeEach(inject(function (_$controller_, _$compile_, _$rootScope_, _CohortChartMocks_, _AlertService_,
                                _CohortSelectionMocks_, _CohortSelectionService_, _DcChartsService_) {
        // The injector unwraps the underscores (_) from around the parameter
        // names when matching
        $controller = _$controller_;
        $compile = _$compile_;
        rootScope = _$rootScope_;
        scope = rootScope.$new();
        CohortSelectionMocks = _CohortSelectionMocks_;
        CohortChartMocks = _CohortChartMocks_;
        CohortSelectionService = _CohortSelectionService_;
        DcChartsService = _DcChartsService_;
        AlertService = _AlertService_;

        scope.gridsterOpts = CohortSelectionMocks.getGridsterOptions();
        scope.gridsterItem = CohortSelectionMocks.getGridsterItem();
        scope.gridster = CohortSelectionMocks.getGridster();
        scope.labels = CohortChartMocks.getMockLabels();
        scope.label = scope.labels[0];
        scope.filterOpt = {
            showFilterInput: false
        };
        var boxId = CohortChartMocks.getBoxId();
        scope.tsLabel = {
            boxId: boxId
        };

        var ctrlElm = angular.element('<div id=' + boxId + '></div>');
        ctrl = $controller('CohortSelectionCtrl', {$scope: scope, $element: ctrlElm});
        CohortSelectionService.getBox = function (boxId) {
            return {
                ctrl: ctrl
            }
        };

        spyOn(angular, 'element').and.returnValue(ctrlElm);
        spyOn(ctrl, 'createCohortChart').and.callFake(function () {
            var _chart = jasmine.createSpyObj('_chart',
                ['on', 'filter', 'render', 'redraw']);
            return _chart;
        });

        var chartHtml = '<ts-cohort-chart class="chart-container" ts-gridster-item="gridsterItem" ts-label="label" ts-gridster="gridster"></ts-cohort-chart>';
        chartElm = $compile(chartHtml)(scope);

        scope.$digest();
    }));

    it('should contain ts-cohort-chart-container', function () {
        expect(chartElm.html()).toContain('chart-container');
    });

    it('should call CohortSelectionCtrl.createCohortChart', function () {
        expect(ctrl.createCohortChart).toHaveBeenCalled();
    });

    it('should listen to chart events', function () {
        var _func = jasmine.any(Function);
        var _chart = chartElm.isolateScope().chart;
        expect(_chart.on).toHaveBeenCalledWith('filtered', _func);
        expect(_chart.on).toHaveBeenCalledWith('renderlet', _func);
    });

    it('should group charts', function() {
        spyOn(ctrl, 'groupCharts');

        // Call group action from isolated directive scope
        chartElm.isolateScope().groupAction();
        expect(ctrl.groupCharts).toHaveBeenCalled();
    });

    it('should have the correct title set', function() {
        expect(chartElm.isolateScope().title).toEqual('Age - GSE8581');
    });

    it('should be able to remove a label ', function() {
        spyOn(ctrl, 'removeLabel');

        // Use beforeEach scoped label
        var label = scope.label;
        chartElm.isolateScope().removeChart(label);
        expect(ctrl.removeLabel).toHaveBeenCalledWith(label);
    });

    it('should be able to clear a filter ', function() {
        spyOn(ctrl, 'clearChartFilterByLabel');

        // Use beforeEach scoped label
        var label = scope.label;
        chartElm.isolateScope().clearFilter(label);
        expect(ctrl.clearChartFilterByLabel).toHaveBeenCalledWith(label);
    });

    it('should perform toggle filter input action only when isBarChart is true', function () {
        var _scope = chartElm.isolateScope();
        _scope.isBarChart = true;
        _scope.toggleFilterInput();
        expect(_scope.filterOpt.showFilterInput).toBe(true);

        _scope.isBarChart = false;
        _scope.toggleFilterInput();
        expect(_scope.filterOpt.showFilterInput).toBe(true);
    });

    describe('filterBarChart', function () {

        beforeEach(function () {
            var _scope = chartElm.isolateScope();
            _scope.chart.xAxisMin = function () {
                return 20;
            };
            _scope.chart.xAxisMax = function () {
                return 100;
            };
        });

        it('should perform bar-chart filtering', function () {
            var _scope = chartElm.isolateScope();
            _scope.filterOpt.min = 20;
            _scope.filterOpt.max = 100;

            spyOn(dc.filters, 'RangedFilter');
            _scope.filterBarChart();
            expect(dc.filters.RangedFilter).toHaveBeenCalled();
            expect(_scope.chart.filter).toHaveBeenCalled();
            expect(_scope.chart.redraw).toHaveBeenCalled();
        });

        it('should report error when isNaN', function () {
            var _scope = chartElm.isolateScope();
            _scope.filterOpt.min = NaN;
            spyOn(AlertService, 'add');
            _scope.filterBarChart();
            expect(AlertService.add).toHaveBeenCalled();
        });

        it('should report error when max <= min', function () {
            var _scope = chartElm.isolateScope();
            _scope.filterOpt.min = 100;
            _scope.filterOpt.max = 100;
            spyOn(AlertService, 'add');
            _scope.filterBarChart();
            expect(AlertService.add).toHaveBeenCalled();
        });

        it('should handle the min == null case', function () {
            var _scope = chartElm.isolateScope();
            _scope.filterOpt.min = null;
            _scope.filterOpt.max = 100;
            _scope.filterBarChart();
        });

        it('should handle the max == null case', function () {
            var _scope = chartElm.isolateScope();
            _scope.filterOpt.min = 20;
            _scope.filterOpt.max = null;
            _scope.filterBarChart();
        });

        it('should handle the min value out of range', function () {
            var _scope = chartElm.isolateScope();
            _scope.filterOpt.min = 19;
            _scope.filterOpt.max = 100;
            _scope.filterBarChart();
        });

        it('should handle the max value out of range', function () {
            var _scope = chartElm.isolateScope();
            _scope.filterOpt.min = 20;
            _scope.filterOpt.max = 101;
            _scope.filterBarChart();
        });

        it('should deal with the case when both min and max inputs are out of bound', function () {
            var _scope = chartElm.isolateScope();
            _scope.filterOpt.min = 0;
            _scope.filterOpt.max = 1;
            _scope.filterBarChart();
        });

    });

});
