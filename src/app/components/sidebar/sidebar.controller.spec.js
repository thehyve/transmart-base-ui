'use strict';

describe('SidebarCtrl', function () {

    beforeEach(module('transmartBaseUi'));

    var ctrl, scope, rootScope, StudyListService, StudyListMocks, dummyStudies;

    beforeEach(inject(function (_$controller_, _$rootScope_, _StudyListService_, _StudyListMocks_) {
        StudyListService = _StudyListService_;
        scope = _$rootScope_.$new();
        rootScope = _$rootScope_;
        ctrl = _$controller_('SidebarCtrl', {
            $scope: scope,
            $rootScope: rootScope
        });
        StudyListService.studyList = [];
        StudyListMocks = _StudyListMocks_;
        dummyStudies = StudyListMocks.studies();
    }));

    it('is should be defined', function () {
        expect(ctrl).not.toEqual(undefined);
    });

    it('should start with no studies loaded', function () {
        expect(ctrl.publicStudies.length).toEqual(0);
        expect(ctrl.privateStudies.length).toEqual(0);
    });

    describe('addSearchKey', function () {

        beforeEach(function () {
            StudyListService.studyList = [];
            StudyListService.studyList.push(dummyStudies[0]);
            StudyListService.studyList.push(dummyStudies[1]);
            StudyListService.studyList.push(dummyStudies[2]);
        });

        it('should add search key into searchKeys list and hide unmatched studies', function () {
            ctrl.searchTerm = 'ss';
            ctrl.searchKeys = [];
            ctrl.addSearchKey();
            expect(ctrl.searchKeys.length).toEqual(1);
            expect(ctrl.searchTerm).toEqual('');
            expect(StudyListService.studyList[0].hide).toBe(true);
        });

        it('should add case insensitive search key into searchKeys list and show matched studies', function () {
            ctrl.searchTerm = 'app';
            ctrl.searchKeys = [];
            ctrl.addSearchKey();
            expect(ctrl.searchKeys.length).toEqual(1);
            expect(ctrl.searchTerm).toEqual('');
            expect(StudyListService.studyList[0].hide).toBe(false);
        });

        it('should not add search key into searchKeys list if search key is empty and show all studies', function () {
            ctrl.searchTerm = '';
            ctrl.searchKeys = [];
            ctrl.addSearchKey();
            expect(ctrl.searchKeys.length).toEqual(0);
            expect(StudyListService.studyList[0].hide).toBe(false);
        });

        it('should not add search key into searchKeys list if search key already exists', function () {
            ctrl.searchTerm = 'a';
            ctrl.searchKeys = ['a'];
            ctrl.addSearchKey();
            expect(ctrl.searchKeys.length).toEqual(1);
        });

        it('should by default perform a OR-based search between two terms and show matched studies', function () {
            ctrl.searchKeys = ['av'];
            ctrl.searchTerm = 'GSE';
            ctrl.addSearchKey();

            expect(ctrl.searchKeys.length).toEqual(2);
            expect(ctrl.operator).toEqual('OR');
            expect(StudyListService.studyList[0].hide).toBe(false);
            expect(StudyListService.studyList[1].hide).toBe(false);
            expect(StudyListService.studyList[2].hide).toBe(false);
        });

        it('should by perform a AND-based search between two terms and show matched studies', function () {
            ctrl.searchKeys = ['av'];
            ctrl.searchTerm = 'GSE';
            ctrl.operator = 'AND';
            ctrl.addSearchKey();

            expect(ctrl.searchKeys.length).toEqual(2);
            expect(ctrl.operator).toEqual('AND');
            expect(StudyListService.studyList[0].hide).toBe(true);
            expect(StudyListService.studyList[1].hide).toBe(true);
            expect(StudyListService.studyList[2].hide).toBe(true);
        });
    });

    describe('removeAllSearchKeys', function () {

        beforeEach(function () {
            StudyListService.studyList = [];
            StudyListService.studyList.push(dummyStudies[0]);
            StudyListService.studyList.push(dummyStudies[1]);
            StudyListService.studyList.push(dummyStudies[2]);
        });

        it('should remove all search keys and display all studies', function () {
            ctrl.searchKeys = ['GSE', 'APP', 'XXX'];
            ctrl.removeAllSearchKeys();
            expect(ctrl.searchKeys.length).toEqual(0);
            expect(StudyListService.studyList[0].hide).toBe(false);
            expect(StudyListService.studyList[1].hide).toBe(false);
            expect(StudyListService.studyList[2].hide).toBe(false);
        });

    });

    describe('removeSearchKey', function () {

        beforeEach(function () {
            StudyListService.studyList = [];
            StudyListService.studyList.push(dummyStudies[1]);
            StudyListService.studyList.push(dummyStudies[2]);
        });

        it('should remove a search key', function () {
            ctrl.searchKeys = ['GSE', 'DDD', 'XXX'];
            ctrl.addSearchKey();
            expect(StudyListService.studyList[0].hide).toBe(false);
            expect(StudyListService.studyList[1].hide).toBe(false);
            ctrl.removeSearchKey('GSE');
            expect(ctrl.searchKeys.length).toEqual(2);
            expect(StudyListService.studyList[0].hide).toBe(true);
            expect(StudyListService.studyList[1].hide).toBe(true);
        });

        it('should remove all search key', function () {
            // reset visibility flag to show
            StudyListService.studyList.forEach(function (s) {
                s.hide = false;
            });

            ctrl.searchKeys = ['GSE'];
            ctrl.addSearchKey();
            expect(StudyListService.studyList[0].hide).toBe(false);
            expect(StudyListService.studyList[1].hide).toBe(false);
            ctrl.removeSearchKey('GSE');
            expect(ctrl.searchKeys.length).toEqual(0);
            expect(StudyListService.studyList[0].hide).toBe(false);
            expect(StudyListService.studyList[1].hide).toBe(false);
        });

    });


});
