'use strict';

describe('QueryBuilderService Unit Tests', function () {

    beforeEach(function () {
        module('transmartBaseUi');
    });

    var QueryBuilderService,
        QueryBuilderMocks;

    beforeEach(inject(function (_QueryBuilderService_, _QueryBuilderMocks_) {
        QueryBuilderService = _QueryBuilderService_;
        QueryBuilderMocks = _QueryBuilderMocks_;
    }));

    it('should convert cohort filters without a selection to cover the entire study', function () {
       expect(QueryBuilderService.convertCohortFiltersToI2B2Panels(QueryBuilderMocks.filterCohortFullStudy()))
            .toEqual(QueryBuilderMocks.filterCohortFullStudyResponse());
    });

    it('should convert cohort filters with categories', function () {
        expect(QueryBuilderService.convertCohortFiltersToI2B2Panels(QueryBuilderMocks.cohortFiltersWithCategories()))
            .toEqual(QueryBuilderMocks.cohortFiltersWithCategoriesResponse());
    });

    it('should convert cohort filters with number ranges', function () {
        expect(QueryBuilderService.convertCohortFiltersToI2B2Panels(QueryBuilderMocks.cohortFiltersWithNumberRanges()))
            .toEqual(QueryBuilderMocks.cohortFiltersWithNumberRangesResponse());

    });

    it('should convert cohort filters to xml', function () {
        expect(
            QueryBuilderService
                .convertCohortFiltersToXML(
                    QueryBuilderMocks.cohortFiltersToXML().cohortFilters,
                    QueryBuilderMocks.cohortFiltersToXML().cohortName)
        )
        .toEqual(QueryBuilderMocks.cohortFiltersToXMLResponse());
    });

});
