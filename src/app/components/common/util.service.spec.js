'use strict';

describe('UtilService Unit Tests', function () {

    beforeEach(function () {
        module('transmartBaseUi');
    });

    var UtilService;
    beforeEach(inject(function (_UtilService_) {
        UtilService = _UtilService_;
    }));

    it('test if url is detected', function () {
        var emptyURL = "";
        var nullURL = null;
        var validURL = "https://www.google.nl/#q=the+hyve";
        var invalidURL = "testtest";

        expect(UtilService.isURL(emptyURL)).toEqual(false);
        expect(UtilService.isURL(nullURL)).toEqual(false);
        expect(UtilService.isURL(validURL)).toEqual(true);
        expect(UtilService.isURL(invalidURL)).toEqual(false);
    })

});
