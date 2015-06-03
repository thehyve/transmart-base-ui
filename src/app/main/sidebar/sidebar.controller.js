'use strict';

angular.module('transmartBaseUi')
  .controller('SidebarCtrl',

  ['$scope', '$window', 'Restangular', 'endpointService',
  function ($scope, $window, Restangular, endpointService) {

    $scope.endpoints = [];
    $scope.formData = {};

    $scope.publicStudies = [];
    $scope.privateStudies = [];

    loadStudies();

    function loadStudies() {
      var endpoints = endpointService.getEndpoints();
      $scope.endpoints = endpoints;
      $scope.publicStudies = [];
      $scope.privateStudies = [];
      
      // Load studies for each endpoint
      endpoints.forEach(function(endpoint) {
        endpoint.restangular.all('studies').getList()
          .then(function (studies) {

            // alert user that it successfully connects to the rest-api
            $scope.alerts.push({type: 'success', msg: 'Successfully connected to rest-api'});

            $scope.studies = studies;

            // Check if studies are public or private
            // TODO: other cases not public or private
            $scope.studies.forEach(function(study){
              study.endpoint = endpoint; // Keep reference to endpoint
              if(study._embedded.ontologyTerm.fullName.split('\\')[1] ==
                "Public Studies") {
                $scope.publicStudies.push(study);
              } else {
                $scope.privateStudies.push(study);
              }
            });
          }, function (err) {
            $scope.alerts.push({type: 'danger', msg: 'Oops! Cannot connect to rest-api.'});
            console.error(err);
          });
      });
    }

    function resetEndpointForm() {
      var formData = $scope.formData;
      formData.title = '';
      formData.url = '';
      formData.requestToken = '';
      formData.endpointForm.$setPristine();
    }

    $scope.navigateToAuthorizationPage = function() {
      var url = $scope.formData.url;
      
      // Cut off any '/'
      if (url.substring(url.length-1, url.length) == '/') {
        url = url.substring(0, url.length-1);
      }

      var authorizationUrl = url + '/oauth/authorize?response_type=code&client_id=api-client&client_secret=api-client&redirect_uri=' + url + '/oauth/verify';
      $window.open(authorizationUrl, '_blank');
    }

    $scope.addResource = function() {
      var formData = $scope.formData;
      if (formData.requestToken) {
        endpointService.addOAuthEndpoint(formData.title, formData.url, formData.requestToken)
          .then(function() {
            resetEndpointForm();
            loadStudies();
          });
      }
      else {
        endpointService.addEndpoint(formData.title, formData.url);
        resetEndpointForm();
        loadStudies();
      }
    }

  }]);
