'use strict';

angular.module('transmartBaseUi')
    .controller('HomeCtrl', ['$state', function ($state) {
        var vm = this;

        $state.go('workspace');
    }]);
