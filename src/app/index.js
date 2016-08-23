'use strict';

/**
 * Configuration for tranSMART-ui module
 * Injection of dependencies and base configuration
 */
angular.module('transmartBaseUi', [
        'ngAnimate',
        'ngCookies',
        'ngTouch',
        'ngSanitize',
        'ui.router',
        'ui.bootstrap',
        'restangular',
        'ui.tree',
        'angular-loading-bar',
        'ngDragDrop',
        'ngCsv',
        'gridster',
        'ui.layout',
        'ui.grid',
        'ui.grid.pagination',
        'ui.grid.resizeColumns',
        'ui.grid.exporter',
        'ui.grid.selection',
        'angular-click-outside',
        'toggle-switch',
        'transmartBaseUiConstants'
    ])
    .config(['$stateProvider',  '$urlRouterProvider', 'cfpLoadingBarProvider', '$locationProvider',
        '$uibTooltipProvider',
        function ($stateProvider, $urlRouterProvider, cfpLoadingBarProvider, $locationProvider, $uibTooltipProvider) {

            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            });

            // Abstract root state defining navbar and footer and an unnamed ui-view for child view injection.
            $stateProvider.state('site', {
                abstract: true,
                template: '<div ui-view> </div>',
                views: {
                    'navbar@': {
                        templateUrl: 'app/components/navbar/navbar.html'
                    },
                    'footer@': {
                        templateUrl: 'app/components/footer/footer.html',
                        controller: 'FooterCtrl'
                    }
                }
            });

            // Default route
            $urlRouterProvider.otherwise('/workspace');

            // Set default actions for popover
            $uibTooltipProvider.setTriggers({'click': 'never'});
            $uibTooltipProvider.options({
                placement: 'right',
                appendToBody: 'true',
                trigger: 'click'
            });

            // Remove spinner from http request loading bar
            cfpLoadingBarProvider.includeSpinner = false;

        }])

    .run(['$rootScope', '$location', '$cookieStore', '$http', 'EndpointService',
        function ($rootScope, $location, $cookieStore, $http, EndpointService) {

            // init globals
            $rootScope.globals = $cookieStore.get('globals') || {};

            EndpointService.initializeEndpoints();
        }]);
