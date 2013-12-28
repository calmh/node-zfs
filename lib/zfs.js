var _ = require('underscore');
var cp = require('child_process');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var util = require('util');
if (!fs.existsSync) {
    fs.existsSync = path.existsSync;
}

function findCmd(name) {
    "use strict";

    var paths = process.env['PATH'].split(':');
    var pathLen = paths.length;
    for (var i = 0; i < pathLen; i++) {
        var sp = path.resolve(paths[i]);
        var fname = path.normalize(path.join(sp, name));
        if (fs.existsSync(fname)) {
            return fname;
        }
    }

    return null;
}

var zfsBin = findCmd('zfs');
function zfs(args, callback) {
    "use strict";

    cp.execFile(zfsBin, args, {maxBuffer: 8000000}, function (err, stdout, stderr) {
        if (callback && typeof callback === 'function') {
            if (err) {
                err.message = _.compact(err.message.split('\n')).join('; ').trim();
                callback(err);
            } else {
                callback(null, stdout);
            }
        }
    });
}

function parseNumber(str) {
    var m = str.match(/^([0-9.]+)([KMGT]?)$/);
    if (!m) {
        return -1;
    }

    var n = parseFloat(m[1]);
    if (m[2] === 'K') {
        n *= 1024;
    } else if (m[2] === 'M') {
        n *= 1024 * 1024;
    } else if (m[2] === 'G') {
        n *= 1024 * 1024 * 1024;
    } else if (m[2] === 'T') {
        n *= 1024 * 1024 * 1024 * 1024;
    } else if (m[2] === 'P') {
        n *= 1024 * 1024 * 1024 * 1024 * 1024;
    }

    return Math.floor(n);
}

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
    obj.used = parseNumber(info[1]);
    if (info[2] !== '-') { // Snapshots don't have 'avail' field.
        obj.avail = parseNumber(info[2]);
    }
    obj.refer = parseNumber(info[3]);
    obj.mountpoint = info[4];

    Object.freeze(obj);
    return obj;
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
    return obj;
}

function list(opts, cb) {
    "use strict";

    if (typeof opts === 'function') {
        cb = opts;
        opts = undefined;
    }

    var params = ['list', '-H'];

    if (opts && opts.type) {
        params.push('-t');
        params.push(opts.type);
    }

    zfs(params, function (err, stdout) {
        if (cb && typeof cb === 'function') {
            var lines = _.compact(stdout.split('\n'));
            var list = lines.map(function (x) { return new ZFS(x); });
            cb(err, list);
        }
    });
}

function get(opts, cb) {
    "use strict";

    var params = [ 'get', '-pH' ];
    if (opts.source) {
        params.push('-s');
        params.push(opts.source);
    }
    params.push(opts.property);

    zfs(params, function (err, stdout) {
        if (cb && typeof cb === 'function') {
            var lines = _.compact(stdout.split('\n'));
            var list = lines.map(function (x) { return new Property(x); });
            cb(err, list);
        }
    });
}

function destroy(opts, cb) {
    "use strict";

    var params = [ 'destroy' ];
    if (opts.recursive) {
        params.push('-r');
    }
    params.push(opts.name);

    zfs(params, cb);
}

function set(opts, cb) {
    "use strict";

    var params = [ 'set' ];

    params.push(opts.property + "=" + opts.value)

    params.push(opts.name);

    zfs(params, cb);
}

function snapshot(opts, cb) {
    "use strict";

    var params = [ 'snapshot' ];
    if (opts.recursive) {
        params.push('-r');
    }
    params.push(opts.dataset + '@' + opts.name);

    zfs(params, cb);
}

exports.get = get;
exports.set = set;
exports.list = list;
exports.destroy = destroy;
exports.snapshot = snapshot;
