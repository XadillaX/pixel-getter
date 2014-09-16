/**
 * XadillaX created at 2014-09-16 11:33
 *
 * Copyright (c) 2014 Huaban.com, all rights
 * reserved.
 */
var fs = require("fs");
var spidex = require("spidex");
var imageType = require('image-type');
var Getter = require("./lib/getter");

function _get(buff, callback) {
    var type = imageType(buff);
    if(!type) {
        return callback(new Error("Not an image file buffer."));
    }

    // each type
    var getter;
    if(type === "png") {
        getter = Getter.createGetter("png", buff);
    } else if(type === "jpg") {
        getter = Getter.createGetter("jpg", buff);
    } else if(type === "gif") {
        getter = Getter.createGetter("gif", buff);
    } else {
        return callback(new Error("Image type \"" + type + "\" not supported yet."));
    }

    process.nextTick(function() {
        getter.parse(callback);
    });
}

/**
 * get pixels
 * @param url
 * @param [callback]
 */
exports.get = function(url, callback) {
    if(undefined === callback) callback = function(){};

    if(url instanceof Buffer) {
        return _get(url, callback);
    }

    // if it's a URL
    if(-1 !== url.indexOf("://")) {
        spidex.get(url, function(data, status, respHeader) {
            var buff = new Buffer(data, "binary");
            _get(buff, callback);
        }, "binary").on("error", function(err) {
            callback(err);
        });
        return;
    }

    // otherwise, open it locally
    fs.readFile(url, function(err, data) {
        if(err) return callback(err);
        _get(data, callback);
    });
};