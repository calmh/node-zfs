var zfs = require('./zfs'),
    zpool = require('./zpool');

//ZFS EXPORTS
exports.get = exports.zfs.get = zfs.get;
exports.set = exports.zfs.get = zfs.set;
exports.list = exports.zfs.get = zfs.list;
exports.destroy = exports.zfs.destroy = zfs.destroy;
exports.create = exports.zfs.create = zfs.create;
exports.snapshot = exports.zfs.snapshot = zfs.snapshot;
exports.clone = exports.zfs.clone = zfs.clone;

//ZPOOL EXPORTS
exports.zpool.set = zpool.set;
exports.zpool.destroy = zpool.destroy;
exports.zpool.create = zpool.create;
exports.zpool.add = zpool.add;

