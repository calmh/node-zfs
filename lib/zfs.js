var _ = require('underscore');
var spawn = require('child_process').spawn;

function ZFS(info) {
    "use strict";

    var obj = Object.create({});
    if (typeof info === 'string') {
        info = info.split(/\s+/);
    }

    if (info.length !== 5) {
        return null;
    }

    obj.name = info[0];
    obj.used = parseInt(info[1], 10);
    if (info[2] !== '-') { // Snapshots don't have 'avail' field.
        obj.avail = parseInt(info[2], 10);
    }
    obj.refer = parseInt(info[3], 10);
    obj.mountpoint = info[4];

    Object.freeze(obj);
    return obj
}

function Property(info) {
    "use strict";

    var obj = Object.create({});
    if (typeof info === 'string') {
        info = info.split(/\s+/, 4);
    }

    if (info.length !== 4) {
        return null;
    }

    obj.name = info[0];
    obj.property = info[1];
    obj.value = info[2];
    obj.source = info[3];

    Object.freeze(obj);
    return obj
}

function getZfsList(data) {
    "use strict";

    var lines = _.compact(data.split('\n'))
    return lines.map(function (x) { return new ZFS(x); });
}

function getZfsGet(data) {
    "use strict";

    var lines = _.compact(data.split('\n'))
    return lines.map(function (x) { return new Property(x); });
}

exports.list = list;
function list(opts, cb) {
    "use strict";

    if (typeof opts == 'function') {
        cb = opts;
        opts = undefined;
    }

    var params = ['list', '-pH'];

    if (opts && opts.type) {
        params.push('-t');
        params.push(opts.type);
    }

    var buf = '';
    var cp = spawn('zfs', params);

    cp.stdout.on('data', function (data) {
        buf += data;
    });
    cp.on('exit', function (code) {
        var list = getZfsList(buf);
        cb(null, list);
    });
}

exports.get = get;
function get(opts, cb) {
    "use strict";

    var params = [ 'get', '-pH' ];
    if (opts.source) {
        params.push('-s');
        params.push(opts.source);
    }
    params.push(opts.property);

    var buf = '';
    var cp = spawn('zfs', params);

    cp.stdout.on('data', function (data) {
        buf += data;
    });
    cp.on('exit', function (code) {
        console.log(getZfsGet(buf));
    });
}

