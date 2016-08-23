'use strict';
/* jshint undef: false */

describe('StudyListService', function () {

    var StudyListService,
        StudyListMocks,
        httpBackend,
        EndpointService,
        Restangular,
        StudyListMocks,
        $rootScope;

    /**
     * Super dummy studies only have id and type
     * {id: number, b: string, c: boolean}}
     * @type {Array}
     */

    beforeEach(function () {
        module('transmartBaseUi');
    });

    beforeEach(inject(function (_StudyListService_, _StudyListMocks_, _$httpBackend_, _EndpointService_, _Restangular_, _$rootScope_) {
        httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        StudyListService = _StudyListService_;
        StudyListMocks = _StudyListMocks_;
        EndpointService = _EndpointService_;
        Restangular = _Restangular_;
    }));

    it('should have StudyListService defined', function () {
        expect(StudyListService).toBeDefined();
        expect(StudyListService.studyList).toBeDefined();
    });

    it('should start with empty studies', function () {
        expect(StudyListService.studyList.length).toEqual(0);
    });

    describe('emptyAll', function () {
        it('should empty studies', function () {
            StudyListService.studyList = StudyListMocks.baseStudies();
            StudyListService.emptyAll();
            expect(StudyListService.studyList.length).toEqual(0);
        });
    });

    describe('getAllStudies', function () {
        var  loadedStudies, _endpoints;

        beforeEach(function () {
            StudyListService.studyList = [];

            httpBackend.whenGET('/studies').respond(StudyListMocks.studies());

            spyOn(Restangular, 'addResponseInterceptor');
            _endpoints = [
                {restangular : Restangular},
                {restangular : Restangular}
            ];
            spyOn(EndpointService, 'getEndpoints').and.returnValue(_endpoints);
        });

        afterEach(function () {
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });

        it('should return cached studied after the second call.', function() {
            expect(StudyListService.studiesResolved).toBeFalsy();

            StudyListService.getAllStudies().then(function (res) {
                expect(EndpointService.getEndpoints).toHaveBeenCalled();
                expect(Restangular.addResponseInterceptor).toHaveBeenCalled();
                expect(res.length).toEqual(6);
            });

            httpBackend.flush();

            expect(StudyListService.studiesResolved).toBeTruthy();

            StudyListService.getAllStudies().then(function (resCached) {
                // Expect it only to have been called once in the original query.
                expect(EndpointService.getEndpoints.calls.count()).toEqual(1);
                expect(resCached.length).toEqual(6);
            });

            $rootScope.$digest();
        });

        it('should load studies depend on number endpoints', function () {
            loadedStudies = StudyListService.getAllStudies().then(function (res) {
                expect(EndpointService.getEndpoints).toHaveBeenCalled();
                expect(Restangular.addResponseInterceptor).toHaveBeenCalled();
                expect(res.length).toEqual(6);
            });

            httpBackend.flush();

        });
    });

    describe('removeStudiesByEndpoint', function () {

        it('should remove studies by selected endpoint', function () {
            StudyListService.studyList = StudyListMocks.studies();
            expect(StudyListService.studyList.length).toEqual(3);

            StudyListService.removeStudiesByEndpoint(StudyListMocks.endpoint());
            expect(StudyListService.studyList.length).toEqual(2);
        });
    });

    describe('showStudiesByKeys', function () {
        it('should show studies matched with search keywords', function () {
            var searchKeys = ['GSE', 'DDD', 'XXX'];
            StudyListService.studyList = StudyListMocks.studies();
            StudyListService.showStudiesByKeys(searchKeys);
            expect(StudyListService.studyList[0].hide).toBe(true);
        });
    });

});
