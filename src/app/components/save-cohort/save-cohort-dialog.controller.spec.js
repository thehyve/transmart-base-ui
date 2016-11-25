'use strict';

describe('SaveCohortDialogCtrl', function () {

    beforeEach(module('transmartBaseUi'));

    var ctrl,
        scope,
        rootScope,
        uibModalInstance,
        cohortSelectionCtrl,
        cohortFilters,
        CohortSelectionService,
        QueryBuilderService,
        CohortSharingService,
        Restangular,
        EndpointService,
        httpBackend,
        AlertService;

    beforeEach(inject(function (_$controller_, _$rootScope_, _CohortSelectionService_,
                                _QueryBuilderService_, _CohortSharingService_,
                                _Restangular_, _EndpointService_, _$httpBackend_) {
        scope = _$rootScope_.$new();
        rootScope = _$rootScope_;
        uibModalInstance = {
            close: function() {},
            dismiss: function() {}
        };
        cohortFilters = {};
        cohortSelectionCtrl = {
            getCohortFilters: function() { return cohortFilters; }
        };
        CohortSelectionService = _CohortSelectionService_;
        CohortSelectionService.boxes = [{
            boxId: 0,
            ctrl: cohortSelectionCtrl
        }];
        CohortSelectionService.currentBoxId = 0;
        QueryBuilderService = _QueryBuilderService_;
        spyOn(QueryBuilderService, 'convertCohortFiltersToXML').and.returnValue('<query></query>');
        CohortSharingService = _CohortSharingService_;
        Restangular = _Restangular_;
        EndpointService = _EndpointService_;
        httpBackend = _$httpBackend_;

        AlertService = { add: function() {}};
        spyOn(AlertService, 'add');

        spyOn(Restangular, 'addResponseInterceptor');
        var _endpoint = {restangular : Restangular};
        spyOn(EndpointService, 'getMasterEndpoint').and.returnValue(_endpoint);

        ctrl = _$controller_('SaveCohortDialogCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $uibModalInstance: uibModalInstance,
            AlertService: AlertService
        });
    }));

    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    it('should save a cohort when ok() is called', function() {
        spyOn(CohortSharingService, 'setSelection');
        spyOn(uibModalInstance, 'close');
        httpBackend.whenPOST('/patient_sets').respond({
            id: '1010',
            setSize: '42'
        });

        ctrl.cohortName = 'my cohort';
        ctrl.ok();
        httpBackend.flush();

        expect(QueryBuilderService.convertCohortFiltersToXML).toHaveBeenCalled();
        expect(AlertService.add).toHaveBeenCalled();
        expect(CohortSharingService.setSelection).toHaveBeenCalledWith(['1010']);
        expect(uibModalInstance.close).toHaveBeenCalled();
    });

    it('should show an error when saving a cohort fails', function() {
        spyOn(uibModalInstance, 'close');
        httpBackend.whenPOST('/patient_sets').respond(500, 'server error');

        ctrl.cohortName = 'my cohort';
        ctrl.ok();
        httpBackend.flush();

        expect(QueryBuilderService.convertCohortFiltersToXML).toHaveBeenCalled();
        expect(AlertService.add).toHaveBeenCalled();
        expect(uibModalInstance.close).toHaveBeenCalled();
    });

    it('should close the dialog when cancel() is called', function() {
        spyOn(uibModalInstance, 'dismiss');
        ctrl.cancel();
        expect(uibModalInstance.dismiss).toHaveBeenCalled();
    })

});
