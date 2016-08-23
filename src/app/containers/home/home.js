'use strict';

/**
 * State configuration definition for 'home'
 */
angular.module('transmartBaseUi')
    .config(function ($stateProvider) {
        $stateProvider
            .state('home', {
                parent: 'site',
                url: '/',
                views: {
                    '@': {
                        templateUrl: 'app/containers/home/home.html'
                    },
                    'content@home': {
                        templateUrl: 'app/containers/home/home.content.html',
                        controller: 'HomeCtrl',
                        controllerAs: 'vm'
                    }
                }
            });
    });
