'use strict';

/**
 * State configuration definition for 'help'
 */
angular.module('transmartBaseUi')
    .config(function ($stateProvider) {
        $stateProvider
            .state('help', {
                parent: 'site',
                url: '/help',
                views: {
                    '@': {
                        templateUrl: 'app/containers/help/help.html'
                    },
                    'content@help': {
                        templateUrl: 'app/containers/help/help.content.html'
                    }
                }
            });
    });
