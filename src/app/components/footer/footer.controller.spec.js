'use strict';

describe('FooterCtrl', function () {
    beforeEach(module('transmartBaseUi'));

    var $controller;

    beforeEach(inject(function (_$controller_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;
    }));

    describe('Footer', function () {
        var $scope, controller;

        it('expects version to be defined.', function () {
            $scope = {};
            controller = $controller('FooterCtrl', {$scope: $scope});
            expect(controller.version).toBeDefined();
        });

    });

});
