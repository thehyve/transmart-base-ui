'use strict';
describe('studyAccordion', function () {
    var scope, template, controller, TreeNodeService, $q;

    beforeEach(function () {
        module('transmartBaseUi');
    });

    // load all angular templates (a.k.a html files)
    beforeEach(module('transmartBaseUIHTML'));

    beforeEach(inject(function ($compile, $rootScope, $controller, _TreeNodeService_, _$q_) {
        scope = $rootScope.$new();
        $q = _$q_;
        TreeNodeService = _TreeNodeService_;

        var element = angular.element("<study-accordion></study-accordion>");
        template = $compile(element)(scope);
        scope.$digest();

        controller = $controller('StudyAccordionCtrl', {$scope: scope});
    }));

    describe('$scope.populateChildren', function () {
        var deferred, _n;

        beforeEach(function () {
            deferred = $q.defer();

            _n = {
                title: 'someTitle',
                total: 999,
                type: 'UNKNOWN',
                isLoading: false
            };

            spyOn(TreeNodeService, 'setRootNodeAttributes').and.returnValue(_n);
            spyOn(TreeNodeService, 'getNodeChildren').and.returnValue(deferred.promise);
            spyOn(controller, 'clearMetadata');
        });

        it('should invoke TreeNodeService.getNodeChildren when populating node children', function () {
            controller.populateChildren({});
            expect(TreeNodeService.setRootNodeAttributes).toHaveBeenCalled();
            expect(TreeNodeService.getNodeChildren).toHaveBeenCalled();
        });

        it('should not invoke TreeNodeService.setRootNodeAttributes when populating study node', function () {
            controller.populateChildren({restObj:'foo'});
            expect(TreeNodeService.setRootNodeAttributes).not.toHaveBeenCalled();
            expect(TreeNodeService.getNodeChildren).toHaveBeenCalled();
        });

    });

    describe('$scope.clearMetadata', function () {
        var _nodes = [
            {
                $$hashKey: 'object:001',
                _embedded: {
                    ontologyTerm: {
                        name: '_embedded-name-1',
                        fullName: '_embedded-fullname-1',
                        metadata: '_embedded-metadata-1'
                    }
                }
            },
            {
                $$hashKey: 'object:002',
                _embedded: {
                    ontologyTerm: {
                        name: '_embedded-name-2',
                        fullName: '_embedded-fullname-2',
                        metadata: '_embedded-metadata-2'
                    }
                }
            }
        ];

        beforeEach(function () {
            controller.prev_node = _nodes[0];
        });

        it('should recognize it is the same node as the previous one, and the popover selection is empty', function () {
            var result = controller.clearMetadata(_nodes[0]);
            expect(result.isSame).toEqual(true);
            expect(result.popover.length).toEqual(0);
        });

        it('should recognize it is a different node from the previous one, and the popover selection is empty', function () {
            var result = controller.clearMetadata(_nodes[1]);
            expect(result.isSame).toEqual(false);
            expect(result.popover.length).toEqual(0);
        });

    });

    describe('$scope.displayMetadata', function () {
        var  _nodes = [
            {restObj: {fullName: 'restObj-fullname', metadata: 'restObj-metadata'}, title: 'restObj-title'},
            {
                _embedded: {
                    ontologyTerm: {
                        name: '_embedded-name',
                        fullName: '_embedded-fullname',
                        metadata: '_embedded-metadata'
                    }
                }
            }
        ];

        beforeEach(function () {
            controller.metadataObj = {};
        });

        it('should use metadata from restObj when node has restObj property', function () {
            controller.displayMetadata(_nodes[0]);
            expect(controller.metadataObj.title).toEqual('restObj-title');
            expect(controller.metadataObj.fullname).toEqual('restObj-fullname');
            expect(controller.metadataObj.body).toEqual('restObj-metadata');
        });

        it('should use metadata from embedded.ontologyTerm when node has _embedded property', function () {
            controller.displayMetadata(_nodes[1]);
            expect(controller.metadataObj.title).toEqual('_embedded-name');
            expect(controller.metadataObj.fullname).toEqual('_embedded-fullname');
            expect(controller.metadataObj.body).toEqual('_embedded-metadata');
        });

        it('should invoke $scope.clearMetadata when $scope.displayMetadata is called', function () {
            spyOn(controller, 'displayMetadata').and.callThrough();
            spyOn(controller, 'clearMetadata');
            controller.displayMetadata(_nodes[0]);
            expect(controller.displayMetadata).toHaveBeenCalled();
            expect(controller.clearMetadata).toHaveBeenCalled();
        });

        it('should not invoke  $scope.displayMetadata when node is null or undefined', function () {
            spyOn(controller, 'displayMetadata').and.callThrough();
            spyOn(controller, 'clearMetadata');
            controller.displayMetadata(null);
            expect(controller.clearMetadata).not.toHaveBeenCalled();

            controller.displayMetadata(undefined);
            expect(controller.clearMetadata).not.toHaveBeenCalled();
        });

    });


});
