/**
 * XadillaX created at 2014-09-16 12:19
 *
 * Copyright (c) 2014 Huaban.com, all rights
 * reserved.
 */
var util = require("util");
var jpeg = require("jpeg-js");
var Getter = require("./getter");

/**
 * jpg getter
 * @param buffer
 * @constructor
 */
var JPGGetter = function(buffer) {
    Getter.call(this, buffer);
};

util.inherits(JPGGetter, Getter);

/**
 * parse pixels
 * @param callback
 */
JPGGetter.prototype.parse = function(callback) {
    var rawImageData;
    try {
        rawImageData = jpeg.decode(this.buffer);
    } catch(err) {
        return callback(err);
    }

    var rgb;
    var result = [];
    for(var i = 0; i < rawImageData.data.length; i += 4) {
        rgb = {
            r   : rawImageData.data.readUInt8(i),
            g   : rawImageData.data.readUInt8(i + 1),
            b   : rawImageData.data.readUInt8(i + 2)
        };
        result.push(rgb);
    }
    callback(undefined, [ result ]);
};

module.exports = JPGGetter;
