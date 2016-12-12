'use strict';

/**
 * SmartR workflow selector PoC
 */
angular.module('transmartBaseUi')
    .config(function ($stateProvider) {
        $stateProvider
            .state('analysis', {
                parent: 'site',
                url: '/analysis',
                views: {
                    '@': {
                        templateUrl: 'app/SmartR/containers/analysisTab/workflows.html'
                    },
                    'content@analysis': {
                        templateUrl: 'app/SmartR/containers/analysisTab/workflows.html'
                    }
                }
            });
    });
