/*jslint node: true*/

'use strict';

var net = require('net'),
    config = require('../config.json'),
    log = require('util').log,
    pcap = require('pcap');

var connect = function () {
    var msg = '',
        client = net.createConnection(config.server.socket_file);
    client.on('connect', function () {
        log('Connected.');
    });


    client.on('data', function (data) {
        log('Received chunk:\n' + data);
        msg += data;
    });

    client.on('end', function () {
        log('Connection closed.');
    });
    return client;
};

var findalldevs = function (callback) {
    var client = connect();

    client.on('data', function (data) {
        callback(JSON.parse(data));
        client.end();
        client = null;
    });
    client.write(JSON.stringify({ method: 'findalldevs' }));
};

var exit = function (callback) {
    var client = connect();

    client.on('end', function () {
        log('Bye! Bye!');
        client.end();
        client = null;
    });

    client.write(JSON.stringify({ method: 'exit' }));
};

var createSession = function (dev, filter, callback) {
    var client = connect();

    client.on('data', callback);
    client.write(JSON.stringify({ method: 'createSession', params: [dev, filter]}));
};

//module.exports.connect = connect;
findalldevs(function (devs) {
    log(devs);
});
createSession('en0', '', function (packet) { log(packet); });
setTimeout(exit, 30000);
