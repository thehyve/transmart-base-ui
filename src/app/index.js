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
        'ui.grid.pinning',
        'angular-click-outside',
        'toggle-switch',
        'transmartBaseUiConstants',
        'transmartBaseUiGitConstants',
        'smartRApp',
        'tmEndpoints',
        'ngIdle'
    ])
    .config(['$stateProvider', '$urlRouterProvider', 'cfpLoadingBarProvider', '$locationProvider',
        '$uibTooltipProvider', '$compileProvider', 'IdleProvider', 'KeepaliveProvider', 'IDLE_IN_MINUTES',
        function ($stateProvider, $urlRouterProvider, cfpLoadingBarProvider, $locationProvider,
                  $uibTooltipProvider, $compileProvider, IdleProvider, KeepaliveProvider, IDLE_IN_MINUTES) {

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
                        templateUrl: 'app/components/navbar/navbar.html',
                        controller: 'NavbarCtrl',
                        controllerAs: 'navbarCtrl'
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

            // enable scope
            $compileProvider.debugInfoEnabled = true;

            //configuration for user idle time management
            IdleProvider.idle(IDLE_IN_MINUTES * 60); // in seconds
            IdleProvider.timeout(10); // in seconds
            KeepaliveProvider.interval(20); // in seconds

        }])

    .run(['$rootScope', '$location', '$cookieStore', '$http', 'EndpointService', 'Idle',
        function ($rootScope, $location, $cookieStore, $http, EndpointService, Idle) {

            // init globals
            $rootScope.globals = $cookieStore.get('globals') || {};

            EndpointService.initializeEndpoints();

            // start watching when the app runs,
            // also starts the Keepalive service by default.
            Idle.watch();
        }]);
