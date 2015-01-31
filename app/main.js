/*jslint node: true, regexp: true*/
'use strict';


var gui = require('nw.gui');

var win = gui.Window.get(),
    nativeMenuBar = new gui.Menu({ type: "menubar" });

nativeMenuBar.createMacBuiltin("HTTP Dev Swiss Army Knife");
win.menu = nativeMenuBar;

// Create a tray icon
var tray = new gui.Tray({
//    title: '',
//    tooltip: 'HTTP Dev Swiss Army Knife',
    icon: 'app/img/icon_16x16' + ((win.window.devicePixelRatio > 1) ? '@2x.png' : '.png'),
    alticon: 'app/img/icon_16x16' + ((win.window.devicePixelRatio > 1) ? '@2x.png' : '.png')
});

// Give it a menu
var menu = new gui.Menu();
menu.append(new gui.MenuItem({
    label: 'Run as root...',
    click: function () {
        require('http-dev-sak-osx-native').launchPriviledged(
            process.execPath,
            process.argv.slice(1).concat(process.execArgv),
            function () {
                console.log('Exit');
                process.exit(0);
            },
            function (err) {
                console.log('Error: ' + err);
            }
        );
    }
}));
//pcap.findalldevs().forEach(function (dev) {
//    menu.append(new gui.MenuItem({ type: 'checkbox', label: dev }));
//});
tray.menu = menu;
