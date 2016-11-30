'use strict';

/**
 * State configuration definition for 'home'
 */
angular.module('transmartBaseUi')
    .config(function ($stateProvider) {
        $stateProvider
            .state('home', {
                parent: 'site',
                url: '/home',
                views: {
                    '@': {
                        templateUrl: 'app/containers/home/home.html',
                        controller: 'HomeCtrl',
                        controllerAs: 'homeCtrl'
                    }
                }
            });
    });
