/*jslint node: true*/
'use strict';

var NwBuilder = require('node-webkit-builder');
var nw = new NwBuilder({
    files: './path/to/nwfiles/**/**', // use the glob format
    platforms: ['osx32', 'osx64', 'win32', 'win64']
});

//Log stuff you want

nw.on('log',  console.log);

// Build returns a promise
nw.build().then(function () {
    console.log('all done!');
}).catch(function (error) {
    console.error(error);
});
