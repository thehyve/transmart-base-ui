'use strict';

describe('CohortView and CohortViewCtrl', function () {
    var $compile,
        scope,
        element,
        CohortViewService,
        EndpointService,
        Restangular,
        httpBackend,
        CohortViewMocks,
        cohorts,
        ctrl,
        QueryParserService,
        $controller,
        CohortSelectionService,
        selectionController;

    // Load the transmartBaseUi module, which contains the directive
    beforeEach(function () {
        module('transmartBaseUi');
    });
    // load all angular templates (a.k.a html files)
    beforeEach(module('transmartBaseUIHTML'));

    // Store references to $rootScope and $compile
    // so they are available to all tests in this describe block
    beforeEach(inject(function (_$compile_, _$rootScope_, _CohortViewService_,
                                _EndpointService_, _Restangular_, _$httpBackend_,
                                _CohortViewMocks_, _QueryParserService_, _$controller_,
                                _CohortSelectionService_) {
        // The injector unwraps the underscores (_) from around the parameter
        // names when matching
        $compile = _$compile_;
        scope = _$rootScope_;
        CohortViewService = _CohortViewService_;
        EndpointService = _EndpointService_;
        Restangular = _Restangular_;
        httpBackend = _$httpBackend_;
        CohortViewMocks = _CohortViewMocks_;
        QueryParserService = _QueryParserService_;
        $controller = _$controller_;
        CohortSelectionService = _CohortSelectionService_;

        selectionController = {};
        CohortSelectionService.boxes = [{ctrl: selectionController}];

        cohorts = CohortViewMocks.cohorts();
        httpBackend.whenGET('/patient_sets').respond(cohorts);
        spyOn(Restangular, 'addResponseInterceptor');
        var _endpoint = {restangular : Restangular};
        spyOn(EndpointService, 'getMasterEndpoint').and.returnValue(_endpoint);

        var _el = angular.element('<cohort-view></cohort-view>');
        // Compile a piece of HTML containing the directive
        element = $compile(_el)(scope);
        ctrl = $controller('CohortViewCtrl', {$scope: scope, $element: element});
        scope.$digest();
    }));

    it('should contain ui-grid', function () {
        expect(element.html()).toContain('ui-grid');
    });

});
