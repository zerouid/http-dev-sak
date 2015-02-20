/*jslint node: true*/

'use strict';

function Request() {
    this.jsonrpc = '2.0';
    this.method = null;
    this.params = null;
    this.id = null;
}

function Response() {
    this.jsonrpc = '2.0';
    this.result = null;
    this.error = null;
    this.id = null;
}

function Error(code, message, data) {
    this.code = code;
    this.message = message;
    this.data = data;
}

module.exports.Request = Request;
module.exports.Response = Response;
module.exports.Errors = {
    PARSE_ERROR : function (data) {
        //Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.
        return new Error(-32700, 'Parse error', data);
    },
    INVALID_REQUEST : function (data) {
        //The JSON sent is not a valid Request object.
        return new Error(-32600,	'Invalid Request');
    },
    METHOD_NOT_FOUND : function (data) {
        //The method does not exist / is not available.
        return new Error(-32601,	'Method not found');
    },
    INVALID_PARAMS : function (data) {
        //Invalid method parameter(s).
        return new Error(-32602,	'Invalid params');
    },
    INTERNAL_ERROR : function (data) {
        //Internal JSON-RPC error.
        return new Error(-32603, 'Internal error');
    },
    SERVER_ERROR : function (code, data) {
        //-32000 to -32099	Server error	Reserved for implementation-defined server-errors.
        return new Error(code, 'Server error', data);
    }
};
