/**
 * Copyright (c) 2016 The Hyve B.V.
 * This code is licensed under the GNU General Public License,
 * version 3, or (at your option) any later version.
 */

'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc filter
 * @name cutString
 * @description Cut chart title when room is too narrow
 */
angular.module('transmartBaseUi')
    .filter('cutString', function () {
        return function (value, max, tail) {
            if (!value) return '';

            max = parseInt(max, 10);
            if (!max) return value;

            if (value.length <= max) return value;

            value = value.substr(0, max);

            return value + (tail || ' …');
        };
});
