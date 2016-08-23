'use strict';

describe('ResourceInterceptors', function () {
    var ResourceInterceptors, AlertService;

    // Load the transmartBaseUi module, which contains the directive
    beforeEach(function () {
        module('transmartBaseUi');
    });

    beforeEach(inject(function (_ResourceInterceptors_, _AlertService_) {
        ResourceInterceptors = _ResourceInterceptors_;
        AlertService = _AlertService_;
    }));

    describe('customResponseInterceptor', function () {

        var _data, _operation, _what, _res;

        beforeEach(function () {
            _data = {_embedded: {ontology_terms : 'ontology_terms', foo:'foo'}};
        });

        it ('should return data when operation is not getList', function () {
            _operation = 'foo';
            _what = 'what';
            _res = ResourceInterceptors.customResponseInterceptor(_data, _operation, _what);
            expect(_res).toEqual(_data);
        });

        it ('should return ontology_terms when operation is getList with concepts as param', function () {
            _operation = 'getList';
            _what = 'concepts';
            _res = ResourceInterceptors.customResponseInterceptor(_data, _operation, _what);
            expect(_res).toEqual('ontology_terms');
        });

        it ('should return data from given param when operation is getList', function () {
            _operation = 'getList';
            _what = 'foo';
            _res = ResourceInterceptors.customResponseInterceptor(_data, _operation, _what);
            expect(_res).toEqual('foo');
        });
    });

    describe('customErrorInterceptor', function () {

        var _response = {status:0}, _alerts;

        beforeEach(function () {
            spyOn(AlertService, 'add').and.callThrough();
        });

        it ('should add error 404 message to alert service', function () {
            _response.status = 404;
            ResourceInterceptors.customErrorInterceptor(_response);
            expect(AlertService.add).toHaveBeenCalled();
            _alerts = AlertService.get();
            expect(_alerts[0].type).toEqual('danger');
            expect(_alerts[0].message)
                .toEqual('HTTP 404: The resource that you are trying to access was moved or does not exist.');
        });

        it ('should add error 401 message to alert service', function () {
            _response.status = 401;
            ResourceInterceptors.customErrorInterceptor(_response);
            expect(AlertService.add).toHaveBeenCalled();
            _alerts = AlertService.get();
            expect(_alerts[0].type).toEqual('danger');
            expect(_alerts[0].message)
                .toEqual('HTTP 401: Unauthorized request.');
        });

        it ('should add error 403 message to alert service', function () {
            _response.status = 403;
            ResourceInterceptors.customErrorInterceptor(_response);
            expect(AlertService.add).toHaveBeenCalled();
            _alerts = AlertService.get();
            expect(_alerts[0].type).toEqual('danger');
            expect(_alerts[0].message)
                .toEqual('HTTP 403: Forbidden request.');
        });

        it ('should add error 500 message to alert service', function () {
            _response.status = 500;
            ResourceInterceptors.customErrorInterceptor(_response);
            expect(AlertService.add).toHaveBeenCalled();
            _alerts = AlertService.get();
            expect(_alerts[0].type).toEqual('danger');
            expect(_alerts[0].message)
                .toEqual('HTTP 500: Internal server error.');
        })

    });

});
