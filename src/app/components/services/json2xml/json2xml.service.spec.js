'use strict';

describe('JSON2XMLService Unit Tests', function () {

    beforeEach(function () {
        module('transmartBaseUi');
    });

    var JSON2XMLService;
    beforeEach(inject(function (_JSON2XMLService_) {
        JSON2XMLService = _JSON2XMLService_;
    }));

    it('should properly serialize json to xml', function () {
        var data = {
            "firstName": "John",
            "lastName": "Smith"
        };
        expect(JSON2XMLService.json2xml(data, '')).toEqual(
            "<firstName>John</firstName><lastName>Smith</lastName>");
    });

});
