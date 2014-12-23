/*jslint node: true, regexp: true*/
'use strict';
var http = require('http'),
    fs = require('fs-extra'),
    path = require('path'),
    unzip = require('unzip'),
    async = require('async'),
    pkg_cfg = require('../package.json');

var version = 'v0.11.3',
    dl_base = 'http://dl.node-webkit.org/',
    build_dir = './build/',
    nw_zip = 'node-webkit-' + version + '-osx-x64.zip',
    app_path = build_dir + pkg_cfg.name + '.app',
    app_dir_match = /^[^\/]*\/(node-webkit\.app)(\/.*)$/i,
    customizations_all = [
        { src: 'icon.icns', dest: '/Contents/Resources/nw.icns', op: fs.copy },
        { src: 'Info.plist', dest: '/Contents/Info.plist', op: fs.copy }
    ],
    customizations_dev = [{ src: '.', dest: '/Contents/Resources/app.nw', op: fs.symlink }],
    customizations_rel = [
        { src: './app', dest: '/Contents/Resources/app.nw/app', op: fs.copy },
        { src: './package.json', dest: '/Contents/Resources/app.nw/package.json', op: fs.copy }
    ];

async.waterfall([
    //Cleanup
    function (cb) {
        console.log('Cleaning up...');
        fs.remove(app_path, cb);
    },
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
            fs.ensureDir(tmpdir, function (err) {
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
        fs.createReadStream(filepath)
            .pipe(unzip.Parse())
            .on('error', function (err) { cb(err); })
            .on('entry', function (entry) {
                if (app_dir_match.test(entry.path)) {
                    var dest_path = entry.path.replace(app_dir_match, app_path + '$2');
                    fs.ensureDir(path.dirname(dest_path), function (err) {
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
            .on('attrs', function (filename, mode) {
                if (app_dir_match.test(filename)) {
                    var dest_path = filename.replace(app_dir_match, app_path + '$2');
                    fs.chmod(dest_path, mode, function (err) {
                        if (err) { cb(err); }
                    });
                }
            })
            .on('close', function () { console.log('Unzip - Done.'); cb(null, app_path); });
    },
    function (app_dir, cb) {
        console.log('Copy customizations...');
        var customs = customizations_all.concat(customizations_dev);
        async.each(customs, function (file, callback) {
            file.op(path.resolve(file.src), path.resolve(app_dir + file.dest), function (err) {
                if (err) {
                    callback(err);
                } else {
                    console.log(file.src + ' to ' + file.dest + ' - Done.');
                    callback();
                }
            });
        }, cb);
    }
], function (err, result) {
    if (err) {
        console.error(err);
    } else {
        console.log('All Done.');
    }
});
