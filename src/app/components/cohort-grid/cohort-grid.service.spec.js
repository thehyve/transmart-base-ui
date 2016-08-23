'use strict';
/* jshint undef: false */

describe('CohortGridService', function () {
    var CohortGridService, $timeout, $q, deferred;

    // Setup
    beforeEach(function () {
        module('transmartBaseUi');
    });

    beforeEach(inject(function (_CohortGridService_, _$timeout_) {
        CohortGridService = _CohortGridService_;
        $timeout = _$timeout_;
    }));

    it('should have predefined options', function () {
        expect(CohortGridService.options.enableGridMenu).toEqual(true);
        expect(CohortGridService.options.enableSelectAll).toEqual(true);
        expect(CohortGridService.options.exporterCsvFilename).toEqual('cohort.csv');
        expect(CohortGridService.options.exporterMenuPdf).toEqual(false);
        expect(CohortGridService.options.paginationPageSizes).toEqual([25, 50, 75]);
        expect(CohortGridService.options.paginationPageSize).toEqual(25);
        expect(CohortGridService.options.columnDefs).toEqual([]);
        expect(CohortGridService.options.data).toEqual([]);
        expect(CohortGridService.options.enableFiltering).toEqual(true);
    });

    describe('prepareColumnDefs', function () {
        var _colDefs, _labels = [{name: 'a'}, {name: 'b'}, {name: 'c'}];

        beforeEach(function () {
            _colDefs = CohortGridService.prepareColumnDefs(_labels);
        });

        it('should define columns from given labels', function () {
            expect(_colDefs[0]).toEqual({field: 'id', width: 200});
        });

        it('should define columns from given labels', function () {
            expect(_colDefs).toEqual([
                {field: 'id', width: 200},
                {field: 'a', width: 200},
                {field: 'b', width: 200},
                {field: 'c', width: 200}
            ]);
        });
    });

    describe('convertToTable', function () {
        var _formatted,
            _labels = [{name: 'a', labelId: 0}, {name: 'b', labelId: 1}, {name: 'c', labelId: 2}],
            _subjects = [{id: 1111, labels: ['aa', 'bb', 'cc']}];

        beforeEach(function () {
            _formatted = CohortGridService.convertToTable(_subjects, _labels);
        });

        it('should format data to table format', function () {
            expect(_formatted).toEqual([{id: 1111, a: 'aa', b: 'bb', c: 'cc'}])
        });
    });

    describe('updateCohortGridView', function () {

        beforeEach(function () {
            spyOn(CohortGridService, 'convertToTable');
            spyOn(CohortGridService, 'prepareColumnDefs');
            CohortGridService.updateCohortGridView([], []);
            $timeout.flush();
        });

        it('should invoke convertToTable', function () {
            expect(CohortGridService.convertToTable).toHaveBeenCalled();
        });

        it('should invoke prepareColumnDefs', function () {
            expect(CohortGridService.prepareColumnDefs).toHaveBeenCalled();
        });

    });

});
