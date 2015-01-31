/*jslint node: true, regexp: true*/
/*global m: true*/
'use strict';

var pcap = require('pcap');

var app_ui = {};

app_ui.config = function (data) {
    this.selected_dev = m.prop(data.selected_dev);
    this.available_devs = pcap.findalldevs();
};

app_ui.vm = {
    init: function () {
        this.cofig = new app_ui.config({selected_dev : null});
    },
    select_dev: function (dev_name) {
        this.config.selected_dev(dev_name);
    }
};

app_ui.controller = function () {
    app_ui.vm.init();
};

app_ui.view = function () {
    return m("html", [
        m("body", [
            m("table", [
                app_ui.vm.cofig.available_devs.map(function (dev, index) {
                    return m("tr", [
                        m("td", dev)
                    ]);
                })
            ])
        ])
    ]);
};
