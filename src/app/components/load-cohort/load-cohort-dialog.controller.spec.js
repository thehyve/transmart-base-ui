'use strict';

describe('LoadCohortDialogCtrl', function () {

    var $controller, scope, ctrl, CohortSelectionService, uibModalInstance;
    beforeEach(module('transmartBaseUi'));


    beforeEach(inject(function (_$controller_, _$rootScope_, _CohortSelectionService_) {
        $controller = _$controller_;
        CohortSelectionService = _CohortSelectionService_;
        scope = _$rootScope_.$new();

        uibModalInstance = {
            close: function() {},
            dismiss: function() {}
        };

        var param = function () {
            return {
                selectedCohorts: {}
            }
        };

        var ctrlElm = angular.element('<div></div>');
        ctrl = $controller('LoadCohortDialogCtrl', {
            $scope: scope,
            $element: ctrlElm,
            $uibModalInstance: uibModalInstance,
            CohortSelectionService: CohortSelectionService,
            param: param
        });
        scope.$digest();
    }));


    it('should load a cohort when ok() is called', function() {
        spyOn(_, 'find').and.callFake(function () {
            return {
                boxId: 'box-id',
                ctrl: {
                    clearSelection: function () {
                    }
                }
            };
        });

        spyOn(CohortSelectionService, 'loadCohorts');
        spyOn(uibModalInstance, 'close');

        ctrl.ok();
        expect(_.find).toHaveBeenCalled();
        expect(CohortSelectionService.loadCohorts).toHaveBeenCalled();
        expect(uibModalInstance.close).toHaveBeenCalled();
    });

    it('should dismiss model when cancel() is called', function () {
        spyOn(uibModalInstance, 'dismiss');
        ctrl.cancel();
        expect(uibModalInstance.dismiss).toHaveBeenCalled();
    });

});
