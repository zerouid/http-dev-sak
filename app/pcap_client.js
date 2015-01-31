/*jslint node: true*/

'use strict';

var net = require('net'),
    config = require('config.json');

var main = function() {
    var client = net.createConnection(config.server.socket_file);
    client.on("connect", function() {
        console.log('Connected to ' + client.remoteAddress);
    });

    var msg = '';

    client.on("data", function(data) {
        console.log('Received chunk:\n' + data);
        msg += data;
    });

    client.on("end", function() {
        console.log('Message received:\n' + msg);
        client.end('Roger that!');
    });
};
