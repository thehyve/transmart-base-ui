'use strict';

describe('Endpoint Service Unit Tests', function () {
    var EndpointService, ResourceService, $cookies, $location;

    // Load the transmartBaseUi module, which contains the directive
    beforeEach(function () {
        module('tmEndpoints');
    });

    beforeEach(inject(function (_EndpointService_, _ResourceService_, _$cookies_, _$location_) {
        EndpointService = _EndpointService_;
        ResourceService = _ResourceService_;
        $cookies = _$cookies_;
        $location = _$location_;
    }));

    describe('saveSelectedEndpoint', function () {
        it('should store cookies', function () {
            spyOn($cookies, 'putObject');
            EndpointService.saveSelectedEndpoint({});
            expect($cookies.putObject).toHaveBeenCalled();
        });
    });

    describe('getSelectedEndpoint', function () {
        it('should store cookies', function () {
            spyOn($cookies, 'getObject').and.callFake(function () {
                return {};
            });
            EndpointService.getSelectedEndpoint();
            expect($cookies.getObject).toHaveBeenCalled();
        });
    });

    describe('initializeMasterEndpoint', function () {
        it('should authorize endpoint', function () {
            EndpointService.masterEndpoint = undefined;
            spyOn(EndpointService, 'authorizeEndpoint');
            EndpointService.initializeMasterEndpoint();
            expect(EndpointService.authorizeEndpoint).toHaveBeenCalledWith(EndpointService.masterEndpoint);
        });

        it('should not authorize master endpoint when there is one', function () {
            EndpointService.masterEndpoint = {};
            spyOn(EndpointService, 'authorizeEndpoint');
            EndpointService.initializeMasterEndpoint();
            expect(EndpointService.authorizeEndpoint).not.toHaveBeenCalled();
        });
    });

    describe('getMasterEndpoint', function () {
        it('should return master endpoint', function () {
            EndpointService.masterEndpoint = {
                id: 'an-example'
            };
            var mep = EndpointService.getMasterEndpoint();
            expect(mep).toEqual(EndpointService.masterEndpoint);
        });
    });

    describe('authorizeEndpoint', function () {
        it('should save endpoint and navigate to auth page', function () {
            var ep = {};
            spyOn(EndpointService, 'saveSelectedEndpoint');
            spyOn(EndpointService, 'navigateToAuthorizationPage');
            EndpointService.authorizeEndpoint(ep);
            expect(EndpointService.saveSelectedEndpoint).toHaveBeenCalledWith(ep);
            expect(EndpointService.navigateToAuthorizationPage).toHaveBeenCalledWith(ep);
        });
    });

    describe('invalidateEndpoint', function () {
        it('should remove endpoint and re-authorize it', function () {
            var ep = {
                status: 'good'
            };
            spyOn(EndpointService, 'removeEndpoint');
            spyOn(EndpointService, 'authorizeEndpoint');
            EndpointService.invalidateEndpoint(ep);
            expect(ep.status).toEqual('error');
            expect(EndpointService.removeEndpoint).toHaveBeenCalledWith(ep);
            expect(EndpointService.authorizeEndpoint).toHaveBeenCalledWith(ep);
        });
    });

    describe('getRedirectURI', function () {

        it('should return direct uri with port when port is not 80 or 443', function () {
            var testURI = EndpointService.getRedirectURI('http', 'localhost', '8001');
            expect(testURI).toBe('http%3A%2F%2Flocalhost%3A8001%2Fconnections');
        });

        it('should return direct uri without port when port is  80', function () {
            var testURI = EndpointService.getRedirectURI('http', 'localhost', '80');
            expect(testURI).toBe('http%3A%2F%2Flocalhost%2Fconnections');
        });

        it('should return direct uri without port when port is  443', function () {
            var testURI = EndpointService.getRedirectURI('http', 'localhost', '443');
            expect(testURI).toBe('http%3A%2F%2Flocalhost%2Fconnections');
        });

    });

    describe('initializeEndpoints', function () {
        it('should initialize hashed endpoints when they exist', function () {
            spyOn($location, 'hash').and.callFake(function () {
                return [{},{}];
            });
            spyOn(EndpointService, 'initializeEndpointWithCredentials');
            spyOn(EndpointService, 'addEndpoint');
            spyOn(EndpointService, 'getSelectedEndpoint');
            spyOn($location, 'url');
            spyOn($location, 'path');
            EndpointService.initializeEndpoints();
            expect(EndpointService.initializeEndpointWithCredentials).toHaveBeenCalled();
            expect(EndpointService.addEndpoint).toHaveBeenCalled();
            expect(EndpointService.getSelectedEndpoint).toHaveBeenCalled();
            expect($location.url).toHaveBeenCalled();
            expect($location.path).toHaveBeenCalled();
        });
    });

    describe('addEndpoint', function () {
        it('should assign endpoint to master if it is one', function () {
            var ep = {
                isMaster: true
            };
            spyOn(EndpointService, 'saveEndpoint');
            EndpointService.addEndpoint(ep);
            expect(EndpointService.endpoints.length).toBeGreaterThan(0);
            expect(EndpointService.masterEndpoint).toBe(ep);
            expect(EndpointService.saveEndpoint).toHaveBeenCalledWith(ep);
        });
    });

    describe('saveEndpoint', function () {
        it('should save endpoint by storing cookies', function () {
            var ep = {
                restangular: {}
            };
            spyOn($cookies, 'getObject').and.callFake(function () {
                return [];
            });
            spyOn($cookies, 'putObject');
            EndpointService.saveEndpoint(ep);
            expect($cookies.getObject).toHaveBeenCalled();
            expect($cookies.putObject).toHaveBeenCalled();
        });

        it('should get empty array when there is no cookie', function () {
            var ep = {
                restangular: {}
            };
            spyOn($cookies, 'getObject').and.callFake(function () {
                return undefined;
            });
            spyOn($cookies, 'putObject');
            EndpointService.saveEndpoint(ep);
            expect($cookies.getObject).toHaveBeenCalled();
            expect($cookies.putObject).toHaveBeenCalled();
        });
    });

    describe('initializeEndpointWithCredentials', function () {

        var _endpoint, _fakeRestangular;

        beforeEach(function () {
            _endpoint = {
                title: "local",
                url: "http://localhost:8080/transmart",
                isOAuth: true,
                isMaster: true,
                apiVersion: 'v1'
            };
            _fakeRestangular = {foo: 'Bar'};
            spyOn(ResourceService, 'createResourceServiceByEndpoint').and.returnValue(_fakeRestangular);
        });

        it('should initialize endpoint with credentials', function () {
            var _res =
                EndpointService.initializeEndpointWithCredentials
                (
                    _endpoint,
                    "access_token=d05451ad-57e1-4703-ae0e-5ece16017e46&token_type=bearer&expires_in=33295&scope=write read"
                );
            expect(_res.status).toEqual('active');
            expect(_res.access_token).toEqual('d05451ad-57e1-4703-ae0e-5ece16017e46');
            expect(_res.token_type).toEqual('bearer');
            expect(_res.expires_in).toEqual('33295');
            expect(_res.scope).toEqual('write read');
            expect(_res.restangular).toEqual(_fakeRestangular);
        });
    });

    describe('retrieveStoredEndpoints', function () {
        var _fakeRestangular;
        beforeEach(function () {
            _fakeRestangular = {foo: 'Bar'};
            spyOn($cookies, 'getObject').and.returnValue(
                [{title: "local", url: "http://localhost:8001/transmart", isOAuth: true, isMaster: true}]
            );
            spyOn(ResourceService, 'createResourceServiceByEndpoint').and.returnValue(_fakeRestangular);
        });

        it('should retrieve stored endpoints from $cookie', function () {
            var _x = EndpointService.retrieveStoredEndpoints('fooCookieKey');
            _x.forEach(function (endpoint) {
                expect(endpoint.restangular).toEqual(_fakeRestangular);
            })
        });

    });

    describe('login', function () {
        it('should invoke initializeEndpoints', function () {
            spyOn(EndpointService, 'initializeEndpoints');
            EndpointService.login();
            expect(EndpointService.initializeEndpoints).toHaveBeenCalled();
        });
    });

    describe('logout', function () {
        it('should remove cookies, and the flag loggedIn should be false', function () {
            spyOn($cookies, 'remove');
            EndpointService.logout();
            expect($cookies.remove).toHaveBeenCalled();
            expect(EndpointService.loggedIn).toBe(false);
        });
    });

    describe('clearStoredEndpoints', function () {
        it('should remove cookies and call initializeMasterEndpoint', function () {
            spyOn($cookies, 'remove');
            spyOn(EndpointService, 'initializeMasterEndpoint');
            EndpointService.clearStoredEndpoints();
            expect($cookies.remove).toHaveBeenCalled();
            expect(EndpointService.initializeMasterEndpoint).toHaveBeenCalled();
        });
    });
});
