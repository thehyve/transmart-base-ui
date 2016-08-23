'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc directive
 * @name baseUiRightClick
 */
angular.module('transmartBaseUi')
    .directive('baseUiRightClick', function ($parse) {
        return function (scope, element, attrs) {
            var fn = $parse(attrs.baseUiRightClick);
            element.bind('contextmenu', function (event) {
                scope.$apply(function () {
                    event.preventDefault();
                    fn(scope, {$event: event});
                });
            });
        };
    });
