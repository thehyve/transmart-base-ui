angular.module('smartRApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('heatmap', {
                parent: 'site',
                url: '/heatmap',
                views: {
                    '@': {
                        templateUrl: 'app/SmartR/containers/heatmap/heatmap.html'
                    },
                    'content@help': {
                        templateUrl: 'app/SmartR/containers/heatmap/heatmap.content.html'
                    }
                }
            });
    });
