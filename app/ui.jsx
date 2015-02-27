/*jslint node: true, regexp: true*/
'use strict';

var React = require('react'),
    mui = require('material-ui'),
    injectTapEventPlugin = require("react-tap-event-plugin"),
    RaisedButton = mui.RaisedButton;

var Main = React.createClass({
    render: function () {
        return (
            <div className="example-page">
                <h1>material-ui</h1>
                <RaisedButton label="Run" primary={true} onTouchTap={this._handleTouchTap} />
            </div>
        );
  },

  _handleTouchTap: function() {
    require('./ui_events').emit('startPcapService');
  }

});

(function () {
    injectTapEventPlugin();
    React.render(<Main />, window.document.body);
})();
