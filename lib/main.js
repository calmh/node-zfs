var zfs = require('./zfs'),
    zpool = require('./zpool');

//ZFS EXPORTS
exports.get = zfs.get;
exports.set = zfs.set;
exports.list = zfs.list;
exports.destroy = zfs.destroy;
exports.create = zfs.create;
exports.snapshot = zfs.snapshot;
exports.clone = zfs.clone;

exports.zfs = {
    set: zfs.set,
    get: zfs.get,
    destroy: zfs.destroy,
    create: zfs.create,
    list: zfs.list,
    snapshot: zfs.snapshot,
    clone: zfs.clone
};

//ZPooL EXPORTS
exports.zpool = {
    set: zpool.set,
    destroy: zpool.destroy,
    create: zpool.create,
    add: zpool.add,
    list: zpool.list,
    get: zpool.get
    //TODO:status
};
