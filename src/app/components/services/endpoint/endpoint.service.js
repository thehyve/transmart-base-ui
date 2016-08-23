'use strict';
/*jshint camelcase: false */

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name EndpointService
 */
angular.module('transmartBaseUi')
    .factory('EndpointService',
        ['$rootScope', '$http', '$q', 'ResourceService', '$cookies', '$window', '$location', 'masterEndpointConfig',
            'isTesting',
            function ($rootScope, $http, $q, ResourceService, $cookies, $window, $location, masterEndpointConfig,
                      isTesting) {

                var service = {};

                // Contains all the endpoints currently connected to
                var endpoints = [];

                // Holds the endpoint which to save user specific settings to
                var masterEndpoint = null;

                var cookieKeyForEndpoints = 'transmart-base-ui-v2.endpoints';
                var cookieKeyForSelectedEndpoint = 'transmart-base-ui-v2.selectedEndpoint';

                /**
                 * Initializes the endpoints by loading them from the cookies, checking
                 * if we're currently being redirected from an authorization page,
                 * saving the credentials if we are or making sure we connect to a master
                 * endpoint if we aren't.
                 * @memberof EndpointService
                 */
                service.initializeEndpoints = function () {
                    service.retrieveStoredEndpoints(cookieKeyForEndpoints); // includes master endpoint

                    // Check if there is an OAuth fragment, which indicates we're in the process
                    // of authorizing an endpoint.
                    var oauthGrantFragment = $location.hash();
                    if (oauthGrantFragment.length > 1) {

                        // Update the current endpoint with the received credentials and save it
                        var selectedConnection = service.initializeEndpointWithCredentials(
                            service.getSelectedEndpoint(),
                            oauthGrantFragment
                        );
                        service.addEndpoint(selectedConnection);

                        $location.url($location.path());
                    }
                    else {
                        if (!isTesting) {
                            service.initializeMasterEndpoint();
                        }
                    }
                };

                /**
                 * Returns the current list of endpoints.
                 * @memberof EndpointService
                 * @returns {Array}
                 */
                service.getEndpoints = function () {
                    return endpoints;
                };

                /**
                 * Adds the endpoint to the list and saves it in the cookies.
                 * @memberof EndpointService
                 * @param endpoint
                 */
                service.addEndpoint = function (endpoint) {
                    endpoints.push(endpoint);
                    if (endpoint.isMaster) {
                        masterEndpoint = endpoint;
                    }
                    service.saveEndpoint(endpoint);
                };

                /**
                 * Removes the specified endpoint from the list and cookies.
                 * @memberof EndpointService
                 * @param endpoint
                 */
                service.removeEndpoint = function (endpoint) {
                    var _in = endpoints.indexOf(endpoint);
                    if (_in >= 0) {
                        endpoints.splice(_in, 1);
                    }

                    // Remove nested restangular object
                    var _end = _.map(endpoints, function (e) {
                        var _n = _.clone(e);
                        _n.restangular = undefined;
                        return _n;
                    });

                    $cookies.putObject(cookieKeyForEndpoints, _end);
                };

                /**
                 * Save authorized endpoint to cookies
                 * @memberof EndpointService
                 * @param endpoint
                 */
                service.saveEndpoint = function (endpoint) {
                    // Temporarily detach the restangular property, as it contains a circular reference
                    var restangular = endpoint.restangular;
                    delete endpoint.restangular;

                    // Store in cookies
                    var storedEndpoints = $cookies.getObject(cookieKeyForEndpoints) || [];
                    storedEndpoints.push(endpoint);
                    $cookies.putObject(cookieKeyForEndpoints, storedEndpoints);

                    // Re-attach the restangular instance
                    endpoint.restangular = restangular;
                };

                /**
                 * Initializes the list of endpoints and the master endpoint
                 * with what's stored in the cookies.
                 * @memberof EndpointService
                 */
                service.retrieveStoredEndpoints = function (strCookieKey) {
                    var storedEndpoints = $cookies.getObject(strCookieKey) || [];
                    storedEndpoints.forEach(function (endpoint) {
                        endpoint.restangular = ResourceService.createResourceServiceByEndpoint(endpoint);
                        endpoints.push(endpoint);
                        if (endpoint.isMaster) {
                            masterEndpoint = endpoint;
                        }
                    });
                    return storedEndpoints;
                };

                /**
                 * Removes all stored endpoints, except for the master endpoint.
                 * @memberof EndpointService
                 */
                service.clearStoredEndpoints = function () {
                    $cookies.remove(cookieKeyForEndpoints);
                    endpoints = [];
                    masterEndpoint = null;
                    service.initializeMasterEndpoint();
                };

                /**
                 * Save selected endpoint to cookie, so we know which endpoint we were
                 * connecting to when the page is reloaded.
                 * @memberof EndpointService
                 * @param endpoint
                 */
                service.saveSelectedEndpoint = function (endpoint) {
                    $cookies.putObject(cookieKeyForSelectedEndpoint, endpoint);
                };

                /**
                 * Get the currently selected endpoint from the cookies.
                 * @memberof EndpointService
                 * @returns {*}
                 */
                service.getSelectedEndpoint = function () {
                    var selectedEndpoint = $cookies.getObject(cookieKeyForSelectedEndpoint);
                    if (!selectedEndpoint) {
                        throw new Error('Cannot find selected endpoint');
                    }
                    return selectedEndpoint;
                };

                /**
                 * Initializes the master endpoint with the one specified if it
                 * is not present yet.
                 * @memberof EndpointService
                 * @param endpoint
                 */
                service.initializeMasterEndpoint = function () {
                    if (!masterEndpoint) {
                        masterEndpoint = masterEndpointConfig;
                        service.authorizeEndpoint(masterEndpointConfig);
                    }
                };

                /**
                 * Returns the master endpoint.
                 * @memberof EndpointService
                 * @returns {*}
                 */
                service.getMasterEndpoint = function () {
                    return masterEndpoint;
                };

                /**
                 * Stores the endpoint to cookies (for future reference) and
                 * navigates to the authorization page for the endpoint.
                 * @memberof EndpointService
                 * @param endpoint
                 */
                service.authorizeEndpoint = function (endpoint) {
                    // Remember which endpoint we're connecting to
                    service.saveSelectedEndpoint(endpoint);
                    service.navigateToAuthorizationPage(endpoint);
                };

                /**
                 * Return redirect URI
                 * @memberof EndpointService
                 * @param port {string}
                 * @param host {string}
                 * @param protocol {string}
                 * @returns {string}
                 */
                service.getRedirectURI = function (protocol, host, port) {
                    if (['80', '443'].indexOf(port) >= 0) {
                        port = '';
                    } else {
                        port = '%3A' + port;
                    }
                    return protocol + '%3A%2F%2F' + host + port + '%2Fconnections';
                };

                /**
                 * Navigate to the endpoint's authorization page.
                 * @memberof EndpointService
                 * @param endpoint
                 */
                service.navigateToAuthorizationPage = function (endpoint) {
                    var currentHost = String($location.host()),
                        currentPort = String($location.port()),
                        currentProtocol = $location.protocol();

                    // Cut off any '/'
                    var url = endpoint.url;
                    if (url.substring(url.length - 1, url.length) === '/') {
                        url = url.substring(0, url.length - 1);
                    }

                    var authorizationUrl = url +
                        '/oauth/authorize?response_type=token&client_id=glowingbear-js&redirect_uri=' +
                        this.getRedirectURI(currentProtocol, currentHost, currentPort);

                    $window.open(authorizationUrl, '_self');
                };

                /**
                 * Sets up a new restangular instance using the specified credentials.
                 * @memberof EndpointService
                 * @param endpoint
                 * @param oauthGrantFragment
                 */
                service.initializeEndpointWithCredentials = function (endpoint, oauthGrantFragment) {
                    endpoint = mergeEndpointCredentials(endpoint, oauthGrantFragment);
                    endpoint.status = 'active';
                    var time = new Date();
                    endpoint.expiresAt = time.setTime(time.getTime() + endpoint.expires_in * 1000);
                    endpoint.restangular = ResourceService.createResourceServiceByEndpoint(endpoint);
                    return endpoint;
                };

                /**
                 * Returns endpoint with merged credentials extracted from URI.
                 * @memberof EndpointService
                 * @param endpoint
                 * @param strFragment
                 * @returns {*}
                 */
                var mergeEndpointCredentials = function (endpoint, strFragment) {
                    var fragmentObj = JSON.parse('{"' +
                        decodeURI(
                            strFragment
                                .replace(/&/g, "\",\"") // replace '&' with ','
                                .replace(/=/g, "\":\"")) + '"}' // replace '=' with ':'
                    );
                    return angular.merge(fragmentObj, endpoint);
                };

                /**
                 * Marks the endpoint as failing.
                 * @memberof EndpointService
                 * @param endpoint
                 */
                service.invalidateEndpoint = function (endpoint) {
                    endpoint.status = 'error';
                    service.removeEndpoint(endpoint);
                    service.authorizeEndpoint(endpoint);
                };

                return service;
            }
        ]);
