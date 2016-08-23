'use strict';
/* jshint undef: false */

describe('AlertService Unit Tests', function () {
    var AlertService, $interval;
    //--------------------------------------------------------------------------------------------------------------------
    // Setup
    beforeEach(function () {
        module('transmartBaseUi');
    });

    beforeEach(inject(function (_AlertService_, _$interval_) {
        AlertService = _AlertService_;
        $interval = _$interval_;
    }));

    beforeEach(function (done) {
        setTimeout(function () {
            done();
        }, 10);
    });

    //--------------------------------------------------------------------------------------------------------------------
    // Tests
    it('should have AlertService defined', function () {
        expect(AlertService).toBeDefined();
    });

    it('should not contain any alerts on startup and return empty array', function () {
        expect(AlertService.get().length).toBe(0);
    });

    it('should return alerts that are added', function () {
        AlertService.add('success', 'Test message');
        var alert = AlertService.get();
        expect(alert.length).toBe(1);
        expect(alert[0].type).toBe('success');
        expect(alert[0].message).toBe('Test message');
    });

    it('should accept multiple alerts', function () {
        AlertService.add('success', 'Test message');
        AlertService.add('success', 'Test message');
        AlertService.add('success', 'Test message');
        AlertService.add('success', 'Test message');
        AlertService.add('success', 'Test message');
        var alert = AlertService.get();
        expect(alert.length).toBe(5);
    });

    it('should remove all alerts when reset', function () {
        AlertService.add('success', 'Test message');
        AlertService.add('success', 'Test message');

        AlertService.reset();
        var alert = AlertService.get();
        expect(alert.length).toBe(0);
    });

    it('should remove remove the right alert by id', function () {
        AlertService.add('success', 'a'); //1
        AlertService.add('success', 'b'); //2
        AlertService.add('success', 'c'); //3

        AlertService.remove(2);
        var alert = AlertService.get();
        expect(alert.length).toBe(2);
        expect(alert[0].message).toBe('a');
        expect(alert[1].message).toBe('c');
    });

    it('not assign same id twice', function () {
        AlertService.add('success', 'a'); //1
        AlertService.add('success', 'b'); //2

        AlertService.remove(2);

        AlertService.add('success', 'b'); //2

        var alert = AlertService.get();
        expect(alert.length).toBe(2);
        expect(alert[0].id).toBe(1);
        expect(alert[1].id).toBe(3);
    });

    it('not delete any alert when id is wrong', function () {
        AlertService.add('success', 'a'); //1
        AlertService.add('success', 'b'); //2

        AlertService.remove(12);
        AlertService.remove(0);
        AlertService.remove(-3);

        var alert = AlertService.get();
        expect(alert.length).toBe(2);
    });

    it('should auto delete alerts with a timeout', function () {
        AlertService.add('success', 'a', 10); //1

        $interval.flush(10);
        var alert = AlertService.get();
        expect(alert.length).toBe(0);

    });

    it('should auto delete the right alert with a timeout', function () {
        AlertService.add('success', 'a');
        AlertService.add('success', 'b');
        AlertService.add('success', 'c', 10);
        AlertService.remove(2);
        AlertService.add('success', 'd');


        $interval.flush(10);
        var alert = AlertService.get();
        expect(alert.length).toBe(2);
        expect(alert[1].message).toBe('d');
        expect(alert[0].message).toBe('a');

    });
});
