/*jslint node: true, regexp: true, nomen: true*/
'use strict';
var glob = require('glob'),
    async = require('async'),
    log = require('util').log,
    path = require('path'),
    exec = require('child_process').exec,
    version = 'v0.12.0-alpha3';

var rootpath = path.resolve(__dirname + '/..'),
    browserify = path.resolve(rootpath + '/node_modules/.bin/browserify'),
    lessc = path.resolve(rootpath + '/node_modules/.bin/lessc');

glob(rootpath + '/app/**/*.jsx', {}, function (err, files) {
    async.each(files, function (f, cb) {
        log('Found jsx file: ' + f);
        log('Running browserify ' + f);
        exec(browserify + ' ' + f + ' -o ' + f.replace(/\.jsx$/i, '.js'),   function (error, stdout, stderr) {
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

glob(rootpath + '/app/**/*.less', {}, function (err, files) {
    async.each(files, function (f, cb) {
        log('Found less file: ' + f);
        log('Running lessc ' + f);
        exec(lessc + ' ' + f + ' > ' + f.replace(/\.less$/i, '.css'),   function (error, stdout, stderr) {
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
