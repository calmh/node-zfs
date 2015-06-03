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

function analyzeVdevOpts (pooltype, deviceList, cb) {

    var devs = [];

    // The pooltype can be blank, 'mirror' or 'raidz'
    if (pooltype) devs.push(pooltype);

    //the devices can be an array ore space separated string.
    if (deviceList.length) {
        devs = devs.concat(deviceList);
    } else {
        var devices = deviceList.split(/\s+/);
        devs = devs.concat(devices);
    }

    //When a mirrored pooltype, we need to repeat the pooltype and the devices

    if (pooltype == 'mirror') {
        devs.push(pooltype);
        if (deviceList.length) {
            devs = devs.concat(deviceList);
        } else {
            var devices = deviceList.split(/\s+/);
            devs = devs.concat(devices);
        }
    } else {
        return devs;
    }

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

    analyzeVdevOpts(opts.poolType, opts.devices, function (devices) {
        params = params.concat(devices);
        zpool(params, cb);
    });
}


function add (opts, cb) {
    "use strict";

    var params = [ 'add', '-f' ];

    params.push(opts.name);

    //poolType can be raidz, mirror or spare
    //devices is an array or a string of devices
    analyzeVdevOpts(opts.poolType, opts.devices, function (devices) {
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

// TODO: exports.get = get;
exports.set = set;
// TODO: exports.list = list;
exports.destroy = destroy;
exports.create = create;
exports.add = add;