'use strict';
/* jshint undef: false */

describe('Metadata Controller Unit Testing', function() {

  var $modalInstanceMock, metadataMock, $controller;

  beforeEach(function() {module('transmartBaseUi');});

  beforeEach (function () {

    metadataMock = {

    };

    $modalInstanceMock =  jasmine.createSpyObj('$modalInstance', ['dismiss']);

    module(function ($provide) {
      $provide.value('metadata', metadataMock);
      $provide.value('$modalInstance', $modalInstanceMock);
    });

  });

  beforeEach(inject(function(_$controller_){
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));


  describe('$scope', function() {

    it ('should define metadata', function () {
      var $scope = {};
      $controller('MetadataCtrl', { $scope: $scope });

      expect($scope.metadata).toBeDefined();
    });

    it('should invoke $modalInstance.dismiss', function () {
      var $scope = {};
      $controller('MetadataCtrl', { $scope: $scope });

      $scope.close();
      expect($modalInstanceMock.dismiss).toHaveBeenCalled();
    });
  });

});
