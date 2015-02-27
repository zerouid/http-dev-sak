/*jslint node: true, regexp: true*/
'use strict';

var util = require("util"),
    events = require("events");

function UIEvents() {
    if (UIEvents.prototype.instance) {
        return UIEvents.prototype.instance;
    }
    events.EventEmitter.call(this);
    UIEvents.prototype.instance = this;
}

util.inherits(UIEvents, events.EventEmitter);

module.exports = new UIEvents();
