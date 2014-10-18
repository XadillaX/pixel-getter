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

function _get(buff, callback, frames) {
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
        getter.parse(callback, frames);
    });
}

/**
 * get pixels
 * @param url
 * @param [callback]
 * @param [frames]
 */
exports.get = function(url, callback, frames) {
    if(undefined === callback) callback = function(){};
    else if(typeof callback !== "function") {
        frames = callback;
        callback = function(){};
    }

    if(undefined === frames) frames = [ 1, 1 ];
    if(typeof frames === "number") frames = [ frames, frames ];

    if(url instanceof Buffer) {
        return _get(url, callback, frames);
    }

    // if it's a URL
    if(-1 !== url.indexOf("://")) {
        spidex.get(url, function(data, status, respHeader) {
            var buff = new Buffer(data, "binary");
            _get(buff, callback, frames);
        }, "binary").on("error", function(err) {
            callback(err);
        });
        return;
    }

    // otherwise, open it locally
    fs.readFile(url, function(err, data) {
        if(err) return callback(err);
        _get(data, callback, frames);
    });
};
