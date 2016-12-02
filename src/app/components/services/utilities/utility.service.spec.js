'use strict'

describe('UtilityService unit tests', function () {

    beforeEach(function () {
        module('transmartBaseUi');
    });

    var utilityService;

    beforeEach(inject(function (_UtilityService_) {
        utilityService = _UtilityService_;
    }));

    describe('guid', function () {

        it('should generate unique string', function () {
            var uid = utilityService.guid();
            var numOfDashes = uid.split('-').length - 1;
            expect(numOfDashes).toBe(4);
            var numOfChars = uid.length;
            expect(numOfChars).toBe(36);

            var uid1 = utilityService.guid();
            expect(uid).not.toEqual(uid1);
        });
    });

    describe('contains', function () {

        it('should check if a string is contained by an array', function () {
            var str = 'a';
            var arr = ['a', 'b'];
            var isContained = utilityService.contains(str, arr);
            expect(isContained).toBe(true);

            isContained = utilityService.contains('c', arr);
            expect(isContained).toBe(false);
        });
    });

});
