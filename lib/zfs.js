var _ = require('underscore');
var cp = require('child_process');
var path = require('path');
var spawn = require('child_process').spawn;
var util = require('util');

function findCmd(name) {
    "use strict";

    var paths = process.env['PATH'].split(':');
    var pathLen = paths.length;
    for (var i = 0; i < pathLen; i++) {
        var sp = path.resolve(paths[i]);
        var fname = path.normalize(path.join(sp, name));
        if (path.existsSync(fname)) {
            return fname;
        }
    }

    return null;
}

var zfsBin = findCmd('zfs');
function zfs(args, callback) {
    "use strict";

    cp.execFile(zfsBin, args, {}, function (err, stdout, stderr) {
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

    var params = ['list', '-pH'];

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
exports.list = list;
exports.destroy = destroy;
exports.snapshot = snapshot;
