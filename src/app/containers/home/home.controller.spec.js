'use strict'

describe('HomeCtrl', function () {
    var $controller, $rootScope, ctrl, scope, EndpointService;

    beforeEach(module('transmartBaseUi'));

    beforeEach(inject(function (_$controller_, _$rootScope_, _EndpointService_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        EndpointService = _EndpointService_;

        var elm = angular.element('<div></div>');
        ctrl = $controller('HomeCtrl', {$scope: scope, $element: elm});
        scope.$digest();
    }));

    it('should call EndpointService.login when login is invoked', function () {
        spyOn(EndpointService, 'login');
        ctrl.login();
        expect(EndpointService.login).toHaveBeenCalled();
    });

});
