'use strict';

/**
 * State configuration definition for 'help'
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
                        templateUrl: 'app/containers/settings/settings.content.html',
                        controller: 'SettingsCtrl',
                        controllerAs: 'vm'
                    }
                }
            });
    });
