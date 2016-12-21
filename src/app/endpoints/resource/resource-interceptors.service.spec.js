'use strict';

describe('ResourceInterceptorService', function () {
    var ResourceInterceptorService, AlertService;

    // Load the transmartBaseUi module, which contains the directive
    beforeEach(function () {
        module('tmEndpoints');
    });

    beforeEach(inject(function (_ResourceInterceptorService_, _AlertService_) {
        ResourceInterceptorService = _ResourceInterceptorService_;
        AlertService = _AlertService_;
    }));

    describe('customResponseInterceptor', function () {

        var _data, _operation, _what, _res;

        beforeEach(function () {
            _data = {
                _embedded: {
                    ontology_terms : 'ontology_terms',
                    subjects: [{},{}],
                    foo:'foo'
                }};
        });

        it ('should return data when operation is not getList', function () {
            _operation = 'foo';
            _what = 'what';
            _res = ResourceInterceptorService.customResponseInterceptor(_data, _operation, _what);
            expect(_res).toEqual(_data);
        });

        it ('should return ontology_terms when operation is getList with concepts as param', function () {
            _operation = 'getList';
            _what = 'concepts';
            _res = ResourceInterceptorService.customResponseInterceptor(_data, _operation, _what);
            expect(_res).toEqual('ontology_terms');
        });

        it ('should return data from given param when operation is getList', function () {
            _operation = 'getList';
            _what = 'foo';
            _res = ResourceInterceptorService.customResponseInterceptor(_data, _operation, _what);
            expect(_res).toEqual('foo');
        });

        it ('should replace "patient_sets" with "subjects"', function () {
            _operation = 'getList';
            _what = 'patient_sets';
            _res = ResourceInterceptorService.customResponseInterceptor(_data, _operation, _what);
            expect(_res.length).toEqual(2);
        });
    });

    describe('customErrorInterceptor', function () {

        var _response = {status:0}, _alerts;

        beforeEach(function () {
            spyOn(AlertService, 'add').and.callThrough();
        });

        it ('should add error 404 message to alert service', function () {
            _response.status = 404;
            ResourceInterceptorService.customErrorInterceptor(_response);
            expect(AlertService.add).toHaveBeenCalled();
            _alerts = AlertService.get();
            expect(_alerts[0].type).toEqual('danger');
            expect(_alerts[0].message)
                .toEqual('HTTP 404: The resource that you are trying to access was moved or does not exist.');
        });

        it ('should add error 401 message to alert service', function () {
            _response.status = 401;
            ResourceInterceptorService.customErrorInterceptor(_response);
            expect(AlertService.add).toHaveBeenCalled();
            _alerts = AlertService.get();
            expect(_alerts[0].type).toEqual('danger');
            expect(_alerts[0].message)
                .toEqual('HTTP 401: Unauthorized request.');
        });

        it ('should add error 403 message to alert service', function () {
            _response.status = 403;
            ResourceInterceptorService.customErrorInterceptor(_response);
            expect(AlertService.add).toHaveBeenCalled();
            _alerts = AlertService.get();
            expect(_alerts[0].type).toEqual('danger');
            expect(_alerts[0].message)
                .toEqual('HTTP 403: Forbidden request.');
        });

        it ('should add error 500 message to alert service', function () {
            _response.status = 500;
            ResourceInterceptorService.customErrorInterceptor(_response);
            expect(AlertService.add).toHaveBeenCalled();
            _alerts = AlertService.get();
            expect(_alerts[0].type).toEqual('danger');
            expect(_alerts[0].message)
                .toEqual('HTTP 500: Internal server error.');
        })

    });

});
