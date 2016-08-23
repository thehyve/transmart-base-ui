'use strict';

/**
 * State configuration definition for 'settings'
 */
angular.module('transmartBaseUi')
    .config(function ($stateProvider) {
        $stateProvider
            .state('settings', {
                parent: 'site',
                url: '/settings',
                views: {
                    '@': {
                        templateUrl: 'app/containers/settings/settings.html'
                    },
                    'content@settings': {
                        templateUrl: 'app/containers/settings/settings.html'
                    }
                }
            })
            .state('settings.connections', {
                parent: 'settings',
                url: '/connections',
                views: {
                    'content@settings': {
                        templateUrl: 'app/containers/settings/connections/connections.html',
                        controller: 'ConnectionsCtrl',
                        controllerAs: 'vm'
                    }
                }
            });
    });
