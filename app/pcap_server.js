/*jslint node: true*/

'use strict';

var net = require('net'),
    fs = require('fs'),
    pcap = require('pcap'),
    config = require('config.json'),
    log = require('util').log;

//if (fs.existsSync(config.server.socket_file)) {
//    fs.unlinkSync(config.server.socket_file);
//}

var server = net.createServer(function (conn) {
    log("Client connected from: " + conn.remotePath);
    conn.write('hello!');
    conn.write('\nI am a pacp server.');
    conn.write('\nMy PID is: ' + process.pid);
    conn.write('\nMy UID is: ' + process.getuid());
    conn.write('\nMy execPath is: ' + process.execPath);
    conn.write('\nMy execArgv are: ' + process.execArgv.toString());
    conn.write('\nMy argv are: ' + process.argv.toString());

    conn.write('\n=======Lets do some work=======');
    conn.write('\nAvailable devs are: ' + JSON.stringify(pcap.findalldevs()));
    conn.write('\nThis is it for now.');

    conn.on('data', function (data) {
        log('Data received by server: ' + data);
    });

    conn.on('end', function () {
        log("Client disconnected from: " + conn.remotePath);
    });
});

//allow reading
server.on('listening', function () {
    // set permissions
    return fs.chmodSync(config.server.socket_file, '777');
});

// double-check EADDRINUSE
server.on('error', function (e) {
    if (e.code !== 'EADDRINUSE') { throw e; }
    net.connect({ path: config.server.socket_file }, function () {
        // really in use: re-throw
        throw e;
    }).on('error', function (e) {
        if (e.code !== 'ECONNREFUSED') { throw e; }
        // not in use: delete it and re-listen
        fs.unlinkSync(config.server.socket_file);
        server.listen(config.server.socket_file);
    });
});

server.listen(config.server.socket_file);
