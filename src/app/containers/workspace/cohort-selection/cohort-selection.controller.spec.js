'use strict';

describe('MainCtrl', function () {
    var $controller, AlertService, ctrl, scope;

    beforeEach(module('transmartBaseUi'));

    beforeEach(inject(function (_$controller_, _AlertService_, _$rootScope_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        scope = _$rootScope_.$new();
        $controller = _$controller_;
        AlertService = _AlertService_;
        ctrl = $controller('CohortSelectionCtrl', {$scope: scope});
    }));
});
