/*jslint node: true, regexp: true, nomen: true*/
'use strict';
var glob = require('glob'),
    async = require('async'),
    log = require('util').log,
    path = require('path'),
    exec = require('child_process').exec,
    version = 'v0.12.0-alpha3';

var modspath = path.resolve(__dirname + '/../node_modules'),
    nwgyp = path.resolve(modspath + '/.bin/nw-gyp');

glob(modspath + '/**/*.gyp', {}, function (err, files) {
    async.each(files, function (f, cb) {
        log('Found gyp file: ' + f);
        var dir = path.dirname(f);
        log('Running nw-gyp in: ' + dir);
        exec('cd ' + dir + ' && ' + nwgyp + ' rebuild --target=' + version,   function (error, stdout, stderr) {
            log('stdout: ' + stdout);
            log('stderr: ' + stderr);
            if (error !== null) {
                log('exec error: ' + error);
            }
            cb(error);
        });
    }, function (err) {
        if (err) {
            log('Error: ' + err);
        }
    });
});
