var cp = require('child_process');
var fs = require('fs');
var path = require('path');
var util = require('util');
if (!fs.existsSync) {
    fs.existsSync = path.existsSync;
}

function compact(array) {
    return array.filter(function (i) {
        if (typeof i.length !== 'undefined')
            return i.length > 0;
        return !!i;
    });
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

function ZPOOL(info) {
    "use strict";

    var obj = Object.create({});
    if (typeof info === 'string') {
        info = info.split(/\s+/);
    }

    if (info.length !== 7) {
        return null;
    }

    obj.name = info[0];
    obj.size = info[1];
    obj.sizeAbsolute = parseNumber(info[1]);
    obj.alloc = info[2];
    obj.sizeAbsolute = parseNumber(info[2]);
    obj.free = info[3];
    obj.freeAbsolute = parseNumber(info[3]);
    obj.cap = info[4];
    obj.health = info[5];
    if (info[6] !== '-') {
        obj.altroot = info[6];
    }

    Object.freeze(obj);
    return obj;
}

function analyzeVdevOpts (deviceList, cb) {

    //The deviceList parameter must include the poolType (mirror, raidz, cache,...)

    var devs = [];

    //the devices can be an array or space separated string.
    if (deviceList.length) {
        devs = devs.concat(deviceList);
    } else {
        var devices = deviceList.split(/\s+/);
        devs = devs.concat(devices);
    }

    return devs;
}

var zpoolBin = findCmd('zpool');
function zpool(args, callback) {
    "use strict";

    cp.execFile(zpoolBin, args, {maxBuffer: 8000000}, function (err, stdout, stderr) {
        if (callback && typeof callback === 'function') {
            if (err) {
                err.message = compact(err.message.split('\n')).join('; ').trim();
                callback(err);
            } else {
                callback(null, stdout);
            }
        }
    });
}

function create (opts, cb) {
    //zpool create -f datastore raidz /dev/vdb /dev/vdc /dev/vdd

    "use strict";

    var params = [ 'create', '-f' ];

    /*
     immediately add some options to the create procedure
     done by adding argument -o option=value
     the opts.options parameter is an array of objects, or a single object

     opts.options = { property: String, value: String }

     OR:

     opts.options = [ { property: String, value: String }, { property: String, value: String } ]

     */

    if (opts.options) {
        if (opts.options.length) {
            //opts.options is an array
            for (var x =0; x < opts.options.length; x++) {
                params.push('-o', opts.options[x].property + "=" + opts.options[x].value);
            }
        } else {
            //opts.options is a single object
            params.push('-o', opts.options.property + "=" + opts.options.value);
        }
    }

    if (opts.mountpoint) {
        params.push('-m', opts.mountpoint);
    }

    params.push(opts.name);

    analyzeVdevOpts(opts.devices, function (devices) {
        params = params.concat(devices);
        zpool(params, cb);
    });
}


function add (opts, cb) {
    "use strict";

    var params = [ 'add', '-f' ];

    params.push(opts.name);

    //devices is an array or a string of devices
    analyzeVdevOpts(opts.devices, function (devices) {
        params = params.concat(devices);
        zpool(params, cb);
    });
}

function set(opts, cb) {
    "use strict";

    var params = [ 'set' ];

    params.push(opts.property + "=" + opts.value);

    params.push(opts.name);

    zpool(params, cb);
}


function destroy(opts, cb) {
    "use strict";

    var params = [ 'destroy', '-f' ];

    params.push(opts.name);

    zpool(params, cb);
}

function list(opts, cb) {
    //list the statistics from a (specific) pool. -o option is NOT available
    "use strict";

    if (typeof opts === 'function') {
        cb = opts;
        opts = undefined;
    }

    var params = ['list', '-pH'];

    if (opts && opts.name) {
        params.push(opts.name);
    }

    zpool(params, function (err, stdout) {
        if (cb && typeof cb === 'function') {
            if (err) {
                cb(err);
                return;
            }
            var lines = compact(stdout.split('\n'));
            var list = lines.map(function (x) { return new ZPOOL(x); });
            cb(err, list);
        }
    });
}


function get(opts, cb) {
    "use strict";

    var params = [ 'get', '-pH' ];
    if (opts.source) {
        params.push('-s', opts.source);
    }

    params.push(opts.property);

    if (opts.name) {
        params.push(opts.name);
    }

    zpool(params, function (err, stdout) {
        if (cb && typeof cb === 'function') {
            if (err) return cb(err);
            var lines = compact(stdout.split('\n'));
            var list = lines.map(function (x) { return new Property(x); });
            cb(err, list);
        }
    });
}

exports.get = get;
exports.set = set;
exports.list = list;
exports.destroy = destroy;
exports.create = create;
exports.add = add;