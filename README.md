                      __                             ___ 
                     /\ \                          /'___\
      ___     ___    \_\ \     __           ____  /\ \__/  ____
    /' _ `\  / __`\  /'_` \  /'__`\ _______/\_ ,`\\ \ ,__\/',__\
    /\ \/\ \/\ \L\ \/\ \L\ \/\  __//\______\/_/  /_\ \ \_/\__, `\
    \ \_\ \_\ \____/\ \___,_\ \____\/______/ /\____\\ \_\\/\____/
     \/_/\/_/\/___/  \/__,_ /\/____/         \/____/ \/_/ \/___/

[![Build Status](https://secure.travis-ci.org/calmh/node-zfs.png)](http://travis-ci.org/calmh/node-zfs)

node-zfs
========

node-zfs is a simple wrapper around the `zfs` and `zpool` commands. It enables
ZFS management scripting using Node.js under SmartOS, Solaris, OpenIndiana and
FreeBSD. Node-zfs is also tested successfully on Ubuntu.

# Installation

Using npm: 

```
$ npm install --save zfs
```
# Usage

```
var zfs-filesystem = require('zfs');
```

##Now you can address the zfs library as follows:

### To use the zfs command implementation:
```
zfs-filesystem.zfs.
```
###To use the zpool implementation:

```
zfs-filesystem.zpool.
```

## Implemented commands for the ZFS tool

###ZFS list

The list command lists a specific zfs dataset or all datasets. All possible options can be found inside the lib/zfs.js file.

```
zfs-filesystem.zfs.list(function (err, list) {
    console.log(list)
});
```

###ZFS get

Get the parameters of a specific dataset or all datasets. All possible options can be found inside the lib/zfs.js file.

```
var opts = {
    name: 'my-dataset-name',
    property: 'quota'
};

zfs-filesystem.zfs.get(opts, function (err, options) {
    console.log(options);
});
```

###ZFS set

Set a specific option for a given dataset. All possible options can be found inside the lib/zfs.js file.

```
var opts = {
    name: 'my-dataset-name',
    property: 'quota',
    value: '1024G'
};

zfs-filesystem.zfs.set(opts, function (err, output) {
    console.log(output);
});
```

###ZFS Destroy

Remove a dataset from the ZFS filesystem

```
var opts = {
    name: 'my-dataset-name'
};

zfs-filesystem.zfs.destroy(opts, function (err, output) {
    console.log(output);
});
```

###ZFS Create

Create a new dataset inside the ZFS filesystem. All possible options can be found inside the lib/zfs.js file.

```
var opts = {
    name: 'my-new-dataset-name'
};

zfs-filesystem.zfs.create(opts, function (err, output) {
    console.log(output);
});
```

###ZFS Snapshot

Creates a snapshot with the given name. All possible options can be found inside the lib/zfs.js file.

```
var opts = {
    name: 'my-new-snapshot-name',
    dataset: 'my-dataset-name
};

zfs-filesystem.zfs.snapshot(opts, function (err, output) {
    console.log(output);
});
```

###ZFS Clone

Creates a clone of the given snapshot. All possible options can be found inside the lib/zfs.js file.

```
var opts = {
    snapshot: 'my-snapshot-name',
    dataset: 'my-mountpoint-name'
};

zfs-filesystem.zfs.clone(opts, function (err, output) {
    console.log(output);
});
```

## Implemented commands for the ZPool tool

###ZPool Create

Creates a new storage pool containing the virtual devices specified. All possible options can be found inside the lib/zpool.js file.

```
var opts = {
    name: 'my-datastore',
    devices: ['/dev/vdb', '/dev/vdc']
};

zfs-filesystem.zpool.create(opts, function (err, output) {
    console.log(output);
});
```

###ZPool Add

Adds the specified virtual devices to the given pool. All possible options can be found inside the lib/zpool.js file.

```
var opts = {
    name: 'my-datastore',
    devices: '/dev/vdd'
};

zfs-filesystem.zpool.add(opts, function (err, output) {
    console.log(output);
});
```

###ZPool Set

Sets the given property on the specified pool. See the zpool manpage for possible options and values.

```
var opts = {
    name: 'my-datastore',
    property: 'comment',
    value: 'Added some comment to a datastore'
};

zfs-filesystem.zpool.set(opts, function (err, output) {
    console.log(output);
});
```

###ZPool Destroy

Destroys the given pool, freeing up any devices for other use.

```
var opts = {
    name: 'my-datastore',
};

zfs-filesystem.zpool.destroy(opts, function (err, output) {
    console.log(output);
});
```

###ZPool List

Lists the given pools along with a health status and space usage. If no pools are specified, all pools in the system are listed. 

```
zfs-filesystem.zpool.list(function (err, output) {
    console.log(output);
});
```

###ZPool Get

Retrieves the given list of properties. When no name and property specified, it shows all properties for all datastores. See the zpool manpage for possible options and values.

```
zfs-filesystem.zpool.get(function (err, output) {
    console.log(output);
});
```

License
-------

MIT
