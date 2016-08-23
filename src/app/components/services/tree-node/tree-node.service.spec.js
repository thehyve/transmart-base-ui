'use strict';


describe('TreeNodeService', function () {

    beforeEach(function () {
        module('transmartBaseUi');
    });

    var $q, deferred, TreeNodeService, httpBackend, TreeNodeMocks;
    var _dummyNode;


    beforeEach(inject(function (_$q_, _TreeNodeService_, _TreeNodeMocks_, _$httpBackend_) {
        $q = _$q_;
        httpBackend = _$httpBackend_;
        deferred = _$q_.defer();
        TreeNodeService = _TreeNodeService_;
        TreeNodeMocks = _TreeNodeMocks_;

        // set dummy node
        _dummyNode = TreeNodeMocks.dummyNode();

    }));


    describe('setRootNodeAttributes', function () {
        it('should set node attributes with some default values', function () {
            var _rootNode = TreeNodeService.setRootNodeAttributes(_dummyNode);
            expect(_rootNode.restObj).toEqual(_dummyNode);
            expect(_rootNode.loaded).toEqual(false);
            expect(_rootNode.study).toEqual(_dummyNode);
            expect(_rootNode.title).toEqual(_dummyNode.title);
            expect(_rootNode.nodes).toEqual([]);
            expect(_rootNode._links.children).toEqual(_dummyNode._embedded.ontologyTerm._links.children);
            expect(_rootNode.isLoading).toEqual(true);
        });
    });

    describe('getTotalSubjects', function () {

        it('should return total number of subjects in a node', function () {
            var sub = TreeNodeMocks.subjects();
            httpBackend.when('GET', '/subjects').respond(sub);
            TreeNodeService.getTotalSubjects(_dummyNode).then(function (s) {
                expect(s).toEqual(2);
            });
        });

        it('should return empty string of total subjects in a node when call is failed', function () {
            httpBackend.when('GET', '/subjects').respond(404);
            spyOn(_dummyNode.restObj, 'one').and.callThrough();
            TreeNodeService.getTotalSubjects(_dummyNode).then(function (s) {
                // skipped since it's should be failed
            }, function (err) {
                expect(err).toEqual('Cannot count subjects');
            });
        });

        afterEach(function () {
            httpBackend.flush();
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });
    });


    describe('loadNode', function () {

        it('should return failed node when request load node failed', function () {
            var prefix = 'concepts/', link = {title: 'SomeLabel'};

            httpBackend.when('GET', '/' + prefix + link.title).respond(404);
            spyOn(_dummyNode.restObj, 'one').and.callThrough();
            TreeNodeService.loadNode(_dummyNode, link, prefix).then(function (res) {
                    // skipped since it should be failed
                },
                function (err) {
                    expect(err).toEqual({
                        title: 'SomeLabel',
                        nodes: [],
                        loaded: true,
                        study: undefined,
                        type: 'FAILED_CALL',
                        total: ''
                    });
                });
        });

        it('should load node details including total number of subjects', function () {
            var response = TreeNodeMocks.treenodeResponse();
            var sub = TreeNodeMocks.subjects();

            var prefix = 'concepts/', link = {title: 'SomeLabel'};
            httpBackend.when('GET', '/' + prefix + link.title).respond(response);
            httpBackend.when('GET', '/' + prefix + link.title + '/subjects').respond(sub);
            spyOn(_dummyNode.restObj, 'one').and.callThrough();
            TreeNodeService.loadNode(_dummyNode, link, prefix).then(function (res) {
                expect(res.restObj.name).toEqual(response.name);
                expect(res.title).toEqual('SomeLabel');
                expect(res.type).toEqual('CATEGORICAL_OPTION');
                expect(res.total).toEqual(2);
                expect(res.loaded).toEqual(false);
                expect(res.nodes).toEqual([]);
            });
        });

        afterEach(function () {
            httpBackend.flush();
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });
    });

    describe('getNodeChildren', function () {
        var prefix, link;

        beforeEach(function () {
            prefix = 'concepts/';
            link = {title: 'SomeLabel'};
            _dummyNode.restObj._links = {
                children: [
                    {
                        "href": "/studies/gse8581/concepts/Endpoints/SomeLabel",
                        "title": "SomeLabel"
                    }],
                nodes: []
            };
        });

        var flushHttoBackend = function () {
            httpBackend.flush();
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        };

        it('should load child nodes', function () {
            var res = TreeNodeMocks.treenodeResponse();
            var sub = TreeNodeMocks.subjects();

            httpBackend.when('GET', '/' + prefix + link.title).respond(res);
            httpBackend.when('GET', '/' + prefix + link.title + '/subjects').respond(sub);
            spyOn(_dummyNode.restObj, 'one').and.callThrough();

            TreeNodeService.getNodeChildren(_dummyNode, 'concepts/').then(function (res) {
                expect(res.length).toEqual(1);
                expect(res[0].title).toEqual('SomeLabel');
                expect(res[0].loaded).toEqual(false);
            });

            flushHttoBackend();
        });

        it('should load failed child nodes', function () {
            httpBackend.when('GET', '/' + prefix + link.title).respond(404);
            httpBackend.when('GET', '/' + prefix + link.title + '/subjects').respond(404);
            spyOn(_dummyNode.restObj, 'one').and.callThrough();

            TreeNodeService.getNodeChildren(_dummyNode, 'concepts/').then(function (res) {
                expect(res.length).toEqual(1);
                expect(res[0].title).toEqual('SomeLabel');
                expect(res[0].loaded).toEqual(true);
                expect(res[0].type).toEqual('FAILED_CALL');
            });

            flushHttoBackend();
        });

        it('should not load node when node is already loaded', function () {
            _dummyNode.loaded = true;
            TreeNodeService.getNodeChildren(_dummyNode).then(function (res) {
                expect(res).toBeTruthy();
            });
        });

        it('should not load node when node does not have children', function () {
            _dummyNode.loaded = false;
            _dummyNode.restObj._links.children = undefined;

            TreeNodeService.getNodeChildren(_dummyNode).then(function (res) {
                expect(res).toBeTruthy();
            });
        });


    });


});
