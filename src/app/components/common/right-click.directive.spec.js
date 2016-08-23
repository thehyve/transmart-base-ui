'use strict';

describe('NgRightClick', function () {
    var $compile, scope, element, $parse;

    // Load the transmartBaseUi module, which contains the directive
    beforeEach(function () {
        module('transmartBaseUi');
    });
    // load all angular templates (a.k.a html files)
    beforeEach(module('transmartBaseUIHTML'));

    // Store references to $rootScope and $compile
    // so they are available to all tests in this describe block
    beforeEach(inject(function (_$compile_, _$rootScope_, _$parse_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $compile = _$compile_;
        scope = _$rootScope_;
        $parse = _$parse_;
    }));

    beforeEach(function () {
        var _el = angular.element('<a base-ui-right-click="someFunction()" href="foo">Test</a>');
        // Compile a piece of HTML containing the directive
        element = $compile(_el)(scope);
        scope.$digest();
    });

    it('should renders base-ui-right-click', function () {
        // Check that the compiled element contains the templated content
        expect(element.html()).toContain('Test');
    });

    it('should scope.$apply right-click event is triggered', function () {
        spyOn(scope, '$apply');
        element.triggerHandler('contextmenu');
        expect(scope.$apply).toHaveBeenCalled();
    });

});
