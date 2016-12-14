/**
 * Copyright (c) 2016 The Hyve B.V.
 * This code is licensed under the GNU General Public License,
 * version 3, or (at your option) any later version.
 */

'use strict';

describe('cutString', function () {
    var $filter;

    // Load the transmartBaseUi module, which contains the directive
    beforeEach(function () {
        module('transmartBaseUi');
    });

    beforeEach(inject(function (_$filter_) {
        $filter = _$filter_;
    }));

    it('should concat string based on provided max value and add tail', function () {
        expect($filter('cutString')('0123456789', 5, ' ...')).toEqual('01234 ...');
    });

    it('should return as is if max and tail not provided', function () {
        expect($filter('cutString')('0123456789')).toEqual('0123456789');
    });

    it('should return string as is if max less than or equal string length', function () {
        expect($filter('cutString')('0123456789', 10, ' ...')).toEqual('0123456789');
        expect($filter('cutString')('0123456789', 20, ' ...')).toEqual('0123456789');
    });

    it('should return empty string if value is undefined', function () {
        expect($filter('cutString')(undefined)).toEqual('');
    });
});
