/**
 * XadillaX created at 2014-09-16 12:43
 *
 * Copyright (c) 2014 Huaban.com, all rights
 * reserved.
 */
var util = require("util");
var readimage = require("readimage");
var Getter = require("./getter");

/**
 * gif getter
 * @param buff
 * @constructor
 */
var GIFGetter = function(buff) {
    Getter.call(this, buff);
};

util.inherits(GIFGetter, Getter);

/**
 * parse pixels
 * @param image
 * @returns {Array}
 * @private
 */
GIFGetter.prototype._parse = function(image, frames) {
    var result = [];

    var max = Math.min(frames[1], image.frames.length - 1);
    for(var i = frames[0]; i <= max; i++) {
        var data = image.frames[i].data;
        var r = [];
        for(var j = 0; j < data.length; j += 4) {
            r.push({
                r: data.readUInt8(j),
                g: data.readUInt8(j + 1),
                b: data.readUInt8(j + 2),
                a: data.readUInt8(j + 3)
            });
        }

        result.push(r);
    }

    return result;
};

/**
 * parse pixels
 * @param callback
 * @param [frames]
 */
GIFGetter.prototype.parse = function(callback, frames) {
    var self = this;
    readimage(this.buffer, function(err, image) {
        if (err) {
            return callback(err);
        }

        try {
            var result = self._parse(image, frames);
            callback(undefined, result);
        } catch(e) {
            callback(e);
        }
    })
};

module.exports = GIFGetter;
