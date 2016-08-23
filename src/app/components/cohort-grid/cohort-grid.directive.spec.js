'use strict';

describe('Unit testing cohort-grid directive', function () {
    var $compile, scope, element;

    // Load the transmartBaseUi module, which contains the directive
    beforeEach(function () {
        module('transmartBaseUi');
    });
    // load all angular templates (a.k.a html files)
    beforeEach(module('transmartBaseUIHTML'));

    // Store references to $rootScope and $compile
    // so they are available to all tests in this describe block
    beforeEach(inject(function (_$compile_, _$rootScope_) {
        // The injector unwraps the underscores (_) from around the parameter
        // names when matching
        $compile = _$compile_;
        scope = _$rootScope_;
        var _el = angular.element('<cohort-grid></cohort-grid>');
        // Compile a piece of HTML containing the directive
        element = $compile(_el)(scope);
        scope.$digest();
    }));

    it('should contain ts-cohort-grid-container', function () {
        expect(element.html()).toContain('ts-cohort-grid-container');
    });

    it('should contain ts-cohort-grid', function () {
        expect(element.html()).toContain('ts-cohort-grid-container');
    });

    it('should contain  ui-grid', function () {
        expect(element.html()).toContain('ui-grid');
    });

});
