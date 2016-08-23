'use strict';

describe('Endpoint Service Unit Tests', function () {
    var endpointService, ResourceService, $cookies;

    // Load the transmartBaseUi module, which contains the directive
    beforeEach(function () {
        module('transmartBaseUi');
    });

    beforeEach(inject(function (_EndpointService_, _ResourceService_, _$cookies_) {
        endpointService = _EndpointService_;
        ResourceService = _ResourceService_;
        $cookies = _$cookies_;
    }));

    describe('getRedirectURI', function () {

        it('should return direct uri with port when port is not 80 or 443', function () {
            var testURI = endpointService.getRedirectURI('http', 'localhost', '8001');
            expect(testURI).toBe('http%3A%2F%2Flocalhost%3A8001%2Fconnections');
        });

        it('should return direct uri without port when port is  80', function () {
            var testURI = endpointService.getRedirectURI('http', 'localhost', '80');
            expect(testURI).toBe('http%3A%2F%2Flocalhost%2Fconnections');
        });

        it('should return direct uri without port when port is  443', function () {
            var testURI = endpointService.getRedirectURI('http', 'localhost', '443');
            expect(testURI).toBe('http%3A%2F%2Flocalhost%2Fconnections');
        });

    });

    describe('initializeEndpointWithCredentials', function () {

        var _endpoint, _fakeRestangular;

        beforeEach(function () {
            _endpoint = {title: "local", url: "http://localhost:8080/transmart", isOAuth: true, isMaster: true};
            _fakeRestangular = {foo: 'Bar'};
            spyOn(ResourceService, 'createResourceServiceByEndpoint').and.returnValue(_fakeRestangular);
        });

        it('should initialize endpoint with credentials', function () {
            var _res =
                endpointService.initializeEndpointWithCredentials
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
        })

    });

    describe('retrieveStoredEndpoints', function () {
        var _fakeRestangular;
        beforeEach(function () {
            _fakeRestangular = {foo: 'Bar'};
            spyOn($cookies, 'getObject').and.returnValue(
                [{title: "local", url: "http://localhost:8080/transmart", isOAuth: true, isMaster: true}]
            );
            spyOn(ResourceService, 'createResourceServiceByEndpoint').and.returnValue(_fakeRestangular);
        });

        it ('should retrieved stored endpoints from $cookie', function () {
            var _x = endpointService.retrieveStoredEndpoints('fooCookieKey');
            _x.forEach(function (endpoint) {
                expect(endpoint.restangular).toEqual(_fakeRestangular);
            })
        });

    });
});
