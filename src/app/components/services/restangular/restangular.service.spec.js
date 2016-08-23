'use strict';

describe('ResourceService', function () {
    var ResourceService, _endpoint1;

    // Load the transmartBaseUi module, which contains the directive
    beforeEach(function () {
        module('transmartBaseUi');
    });

    beforeEach(inject(function (_ResourceService_) {
        ResourceService = _ResourceService_;

        _endpoint1 = {
            url : 'http://foo.bar',
            access_token : '88888888'
        }
    }));

    describe('createResourceServiceByEndpoint', function () {
        it ('should create resource service using given values from given endpoint', function () {
            var _resource = ResourceService.createResourceServiceByEndpoint(_endpoint1);
            expect(_resource.configuration.baseUrl).toEqual(_endpoint1.url);
            expect(_resource.defaultHeaders.Authorization).toEqual('Bearer ' +  _endpoint1.access_token);
        });

    });

});
