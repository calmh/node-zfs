var cp = require('child_process');
var util = require('./util');



function ZPool(info) {
    "use strict";

    var obj = Object.create({});
    if (typeof info === 'string') {
        info = info.split(/\s+/);
    }

    if (info.length !== 10) {
        return null;
    }

    obj.name = info[0];
    obj.size = info[1];
    obj.alloc = info[2];
    obj.free = info[3];
    obj.cap = info[4];
    obj.health = info[5];
    if (info[6] !== '-') {
        obj.altroot = info[6];
    }

    Object.freeze(obj);
    return obj;
}

function analyzeVdevOpts (deviceList) {

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

var zpoolBin = util.findCmd('zpool');
function zpool(args, callback) {
    "use strict";

    cp.execFile(zpoolBin, args, {maxBuffer: 8000000}, function (err, stdout, stderr) {
        if (callback && typeof callback === 'function') {
            if (err) {
                err.message = util.compact(err.message.split('\n')).join('; ').trim();
                callback(err);
            } else {
                if (!stdout || stdout == '') stdout = 'Request succesfully fulfilled!';
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

    params = params.concat(analyzeVdevOpts(opts.devices));

    zpool(params, cb);
}


function add (opts, cb) {
    "use strict";

    var params = [ 'add', '-f' ];

    params.push(opts.name);

    //devices is an array or a string of devices
    params = params.concat(analyzeVdevOpts(opts.devices));

    zpool(params, cb);
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

    var params = ['list', '-H'];

    if (opts && opts.name) {
        params.push(opts.name);
    }

    zpool(params, function (err, stdout) {
        if (cb && typeof cb === 'function') {
            if (err) {
                cb(err);
                return;
            }
            var lines = util.compact(stdout.split('\n'));
            var list = lines.map(function (x) { return new ZPool(x); });
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
            var lines = util.compact(stdout.split('\n'));
            var list = lines.map(function (x) { return new util.Property(x); });
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