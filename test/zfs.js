var assert = require('assert');
var should = require('should');
var zfs = require('zfs');

describe('zfs', function () {
    describe('list', function () {
        it('returns a list of ZFS filesystems', function (done) {
            var expected = [ {
                name: 'zones',
                used: 1004799731712,
                avail: 956926580736,
                refer: 328704,
                mountpoint: '/zones'
            },
            {
                name: 'zones/f78f9208-9c26-47f7-9e03-881a96d17c04',
                used: 590843904,
                avail: 10146574336,
                refer: 694054400,
                mountpoint: '/zones/f78f9208-9c26-47f7-9e03-881a96d17c04'
            },
            {
                name: 'zones/f78f9208-9c26-47f7-9e03-881a96d17c04/data',
                used: 73728,
                avail: 10146574336,
                refer: 31744,
                mountpoint: '/data'
            } ];
            zfs.list(function (err, list) {
                should.not.exist(err);
                list.should.eql(expected);
                done();
            });
        });
        it('returns a list of ZFS snapshots', function (done) {
            var expected = [ {
                name: 'zones/f78f9208-9c26-47f7-9e03-881a96d17c04/data@daily-20120430',
                used: 1024,
                refer: 32768,
                mountpoint: '-'
            },
            {
                name: 'zones/f78f9208-9c26-47f7-9e03-881a96d17c04/data@daily-20120501',
                used: 1024,
                refer: 32768,
                mountpoint: '-'
            },
            {
                name: 'zones/f78f9208-9c26-47f7-9e03-881a96d17c04/data@daily-20120502',
                used: 1024,
                refer: 32768,
                mountpoint: '-'
            } ];
            zfs.list({ type: 'snapshot' }, function (err, list) {
                should.not.exist(err);
                list.should.eql(expected);
                done();
            });
        });
    });
    describe('get', function (done) {
        it('returns a list of property', function () {
            var expected = [ {
                name: 'zones',
                property: 'compression',
                value: 'on',
                source: 'local'
            },
            {
                name: 'zones/f78f9208-9c26-47f7-9e03-881a96d17c04',
                property: 'compression',
                value: 'on',
                source: 'inherited'
            },
            {
                name: 'zones/f78f9208-9c26-47f7-9e03-881a96d17c04/data',
                property: 'compression',
                value: 'on',
                source: 'inherited'
            },
            {
                name: 'zones/f78f9208-9c26-47f7-9e03-881a96d17c04/data@daily-20120430',
                property: 'compression',
                value: '-',
                source: '-'
            } ];
            zfs.get({}, function (err, list) {
                should.not.exist(err);
                list.should.eql(expected);
                done();
            });
        });
    });
});

