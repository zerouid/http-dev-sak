/*jslint node: true, regexp: true*/
'use strict';
var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    unzip = require('unzip'),
    async = require('async'),
    pkg_cfg = require('../package.json');

var version = 'v0.11.3',
    dl_base = 'http://dl.node-webkit.org/',
    build_dir = path.resolve('./build/'),
    nw_zip = 'node-webkit-' + version + '-osx-x64.zip',
    app_dir_match = /^[^\/]*\/(node-webkit\.app)(\/.*)$/i,
    plist_replace = {
        'CFBundleName': pkg_cfg.name,
        'CFBundleDisplayName': pkg_cfg.name,
        'CFBundleVersion': pkg_cfg.version,
        'CFBundleShortVersionString': pkg_cfg.version
//        'NSHumanReadableCopyright': 'Ivan Minchev'
    };

function ensureDir(dir, callback) {
    fs.exists(dir, function (exists) {
        if (exists) { return callback(null); }
        var parent = path.dirname(dir);
        ensureDir(parent, function (err) {
            if (err) { callback(err); }
            fs.mkdir(dir, function (err) {
                callback(err);
            });
        });
    });
}

async.waterfall([
    //Check if package was already downloaded
    function (cb) {
        console.log('Checking if cached...');
        var filepath = build_dir + 'tmp/' + nw_zip;
        fs.exists(filepath, function (exists) {
            console.log('Cached: ' + exists);
            cb(null, filepath, exists);
        });
    },
    //Create temp dir if needed
    function (filepath, cached, cb) {
        if (cached) {
            cb(null, filepath, cached);
        } else {
            console.log('Creating temp dir...');
            var tmpdir = path.dirname(filepath);
            ensureDir(tmpdir, function (err) {
                console.log('Temp dir: ' + tmpdir + ' - created!');
                cb(err, filepath, cached);
            });
        }
    },
    function (filepath, cached, cb) {
        if (cached) {
            cb(null, filepath);
        } else {
            var url = dl_base + version + '/' + nw_zip,
                file = fs.createWriteStream(build_dir + 'tmp/' + nw_zip);
            console.log('Downloading package: ' + url + ' to ' + filepath + ' ...');

            file.on('finish', function () {
                console.log('Download complete.');
                cb(null, filepath);
            });

            http.get(url, function (response) {
                response.pipe(file);
            }).on('error', function (e) {
                cb(e);
            });
        }
    },
    function (filepath, cb) {
        console.log('Unziping ' + filepath + ' ...');
        var app_path = build_dir + pkg_cfg.name + '.app';
        fs.createReadStream(filepath)
            .pipe(unzip.Parse())
            .on('error', function (err) { cb(err); })
            .on('entry', function (entry) {
                if (app_dir_match.test(entry.path)) {
                    var dest_path = entry.path.replace(app_dir_match, app_path + '$2');
                    ensureDir(path.dirname(dest_path), function (err) {
                        if (err) {
                            cb(err);
                        } else {
                            entry.pipe(fs.createWriteStream(dest_path)).on('error', function (err) { cb(err); });
                        }
                    });
                } else {
                    entry.autodrain();
                }
            })
            .on('end', function () { cb(null, app_path); });
    },
    function (app_dir, cb) {
        fs.createReadStream('icon.icns').pipe(fs.createWriteStream(app_dir + '/Contents/Resources/nw.icns')).on('error', function (err) { cb(err); });
    }
], function (err, result) {
    if (err) {
        console.error(err);
    } else {
        console.log('Done.');
    }
});
