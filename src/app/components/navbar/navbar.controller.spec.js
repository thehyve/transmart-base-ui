'use strict'

describe('NavbarCtrl', function () {
    var $controller, $rootScope, $state, ctrl, scope, EndpointService;

    beforeEach(module('transmartBaseUi'));

    beforeEach(inject(function (_$controller_, _$rootScope_, _$state_, _EndpointService_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $state = _$state_;
        scope = $rootScope.$new();
        EndpointService = _EndpointService_;

        var elm = angular.element('<div></div>');
        ctrl = $controller('NavbarCtrl', {$scope: scope, $element: elm});
        scope.$digest();
    }));

    it('should call EndpointService.logout when logout is invoked', function () {
        spyOn(EndpointService, 'logout');
        ctrl.logout();
        expect(EndpointService.logout).toHaveBeenCalled();
    });

    it('should change the flag showNavbar when EndpointService.loggedIn is changed', function () {
        EndpointService.loggedIn = false;
        scope.$digest();
        expect(ctrl.showNavbar).toBe(false);
    });

    it('should listen to IdleStart event', function () {
        scope.$broadcast('IdleStart');
        expect(ctrl.warningDialog).not.toBe(null);
    });

    it('should listen to IdleTimeout event', function () {
        ctrl.warningDialog = {
            close: function () {
            }
        };
        spyOn(ctrl.warningDialog, 'close');
        spyOn(ctrl, 'logout');
        scope.$broadcast('IdleTimeout');
        expect(ctrl.warningDialog.close).toHaveBeenCalled();
        expect(ctrl.logout).toHaveBeenCalled();
    });

});
