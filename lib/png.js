/**
 * XadillaX created at 2014-09-16 11:49
 *
 * Copyright (c) 2014 Huaban.com, all rights
 * reserved.
 */
var util = require("util");
var PNG = require('png-js');
var Getter = require("./getter");

/**
 * png getter
 * @param buff
 * @constructor
 */
var PNGGetter = function(buff) {
    Getter.call(this, buff);
};

util.inherits(PNGGetter, Getter);

/**
 * parse pixels
 * @param pixels
 * @returns {Array}
 * @private
 */
PNGGetter.prototype._parse = function(pixels) {
    var rgb;
    var result = [];
    for(var i = 0; i < pixels.length; i += 4) {
        rgb = {
            r: pixels.readUInt8(i),
            g: pixels.readUInt8(i + 1),
            b: pixels.readUInt8(i + 2),
            a: pixels.readUInt8(i + 3)
        };

        result.push(rgb);
    }

    return result;
};

/**
 * parse pixels
 * @param callback
 */
PNGGetter.prototype.parse = function(callback) {
    try {
        var png = new PNG(this.buffer);
    } catch(e) {
        return callback(e);
    }

    var self = this;
    png.decode(function(pixels) {
        try {
            var result = self._parse(pixels);
            callback(undefined, [ result ]);
        } catch(e) {
            callback(e);
        }
    });
};

module.exports = PNGGetter;
