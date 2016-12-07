'use strict';

describe('QueryParserService Unit Tests', function () {

    beforeEach(function () {
        module('transmartBaseUi');
    });

    var QueryParserService,
        QueryBuilderMocks,
        CohortSelectionCtrl,
        $controller,
        ctrl,
        scope,
        StudyListService,
        TreeNodeService,
        $q,
        numericNode,
        categoricalLeafNode,
        categoricalParentNode,
        highDimNode,
        rangedFilter,
        nodeTypeMapping;

    beforeEach(inject(function (_QueryParserService_, _QueryBuilderMocks_,
                                _$controller_, _AlertService_, _$rootScope_,
                                _StudyListService_, _TreeNodeService_, _$q_) {
        QueryParserService = _QueryParserService_;
        QueryBuilderMocks = _QueryBuilderMocks_;
        scope = _$rootScope_.$new();
        $controller = _$controller_;
        StudyListService = _StudyListService_;
        TreeNodeService = _TreeNodeService_;
        $q = _$q_;

        // Dummy study and nodes
        spyOn(StudyListService, 'getStudy').and.returnValue({});
        numericNode = { type: 'NUMERIC' };
        categoricalParentNode = { type: 'CATEGORICAL_CONTAINER' };
        categoricalLeafNode = { type: 'CATEGORICAL_OPTION', parent: categoricalParentNode };
        highDimNode = { type: 'HIGH_DIMENSIONAL' };

        // We're mocking the dc.filters.RangedFilter() call, because it is not
        // properly matching different instances
        rangedFilter = dc.filters.RangedFilter('65', '70');
        spyOn(dc.filters, 'RangedFilter').and.callFake(function() {
            // Just return the arguments passed to create the RangedFilter
            return rangedFilter;
        });

        // Let TreeNodeService.expandConcept return dummy nodes with the correct type
        nodeTypeMapping = {
            'Age': numericNode,
            'Height': numericNode,
            'Organism': categoricalParentNode,
            'carcinoid': categoricalLeafNode,
            'hematoma': categoricalLeafNode,
            'female': categoricalLeafNode,
            'Lung': highDimNode
        };
        spyOn(TreeNodeService, 'expandConcept').and.callFake(function(node, conceptSplit) {
            var nodeName = conceptSplit[conceptSplit.length - 1];
            return $q.when(nodeTypeMapping[nodeName]);
        });


        var ctrlElm = angular.element('<div></div>');
        ctrl = $controller('CohortSelectionCtrl', {$scope: scope, $element: ctrlElm});

        scope.$digest();
    }));

    it('should parse query xml and add cohort filters', function() {
        spyOn(ctrl, 'addNodeWithFilters');

        QueryParserService.convertCohortFiltersFromXML(QueryBuilderMocks.cohortFiltersXML(), ctrl);
        scope.$digest(); // to make promise resolve

        expect(ctrl.addNodeWithFilters).toHaveBeenCalledWith(numericNode, [rangedFilter]);
        expect(ctrl.addNodeWithFilters).toHaveBeenCalledWith(categoricalParentNode, ['carcinoid', 'hematoma']);
        expect(ctrl.addNodeWithFilters).toHaveBeenCalledTimes(2);
    });

    it('should parse query xml to a description', function() {
        expect(QueryParserService.parseQueryXMLToDescription(QueryBuilderMocks.cohortFiltersXML()))
            .toEqual('GSE8581 Age [65.0,70.0] Diagnosis [carcinoid, hematoma] ');
    });

    it('should parse i2b2 queries with number ranges', function() {
        spyOn(ctrl, 'addNodeWithFilters');

        var queryObj = {
            query_name: 'test',
            panel: QueryBuilderMocks.cohortFiltersWithNumberRangesI2B2Panels()
        };
        QueryParserService.convertCohortFiltersFromQueryDefinition(queryObj, ctrl);
        scope.$digest(); // to make promise resolve

        expect(ctrl.addNodeWithFilters).toHaveBeenCalledWith(numericNode, [rangedFilter]);
        expect(ctrl.addNodeWithFilters).toHaveBeenCalledWith(numericNode, []);
        expect(ctrl.addNodeWithFilters).toHaveBeenCalledTimes(2);
    });

    it('should parse i2b2 queries with categories', function() {
        spyOn(ctrl, 'addNodeWithFilters');

        var queryObj = {
            query_name: 'test',
            panel: QueryBuilderMocks.cohortFiltersWithCategoriesI2B2Panels()
        };
        QueryParserService.convertCohortFiltersFromQueryDefinition(queryObj, ctrl);
        scope.$digest(); // to make promise resolve

        expect(ctrl.addNodeWithFilters).toHaveBeenCalledWith(categoricalParentNode, []);
        expect(ctrl.addNodeWithFilters).toHaveBeenCalledWith(categoricalParentNode, ['female']);
        expect(ctrl.addNodeWithFilters).toHaveBeenCalledWith(categoricalParentNode, ['carcinoid', 'hematoma']);
        expect(ctrl.addNodeWithFilters).toHaveBeenCalledTimes(3);
    });

    it('should parse i2b2 queries with high dimensional data', function() {
        spyOn(ctrl, 'addNodeWithFilters');

        var queryObj = {
            query_name: 'test',
            panel: QueryBuilderMocks.cohortFiltersWithHighDimDataI2B2Panels()
        };
        QueryParserService.convertCohortFiltersFromQueryDefinition(queryObj, ctrl);
        scope.$digest(); // to make promise resolve

        expect(ctrl.addNodeWithFilters).toHaveBeenCalledWith(highDimNode, []);
        expect(ctrl.addNodeWithFilters).toHaveBeenCalledTimes(1);
    });
});
