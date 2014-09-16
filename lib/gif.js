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
 * @param callback
 */
GIFGetter.prototype.parse = function(callback) {
    readimage(this.buffer, function (err, image) {
        if(err) {
            return callback(err);
        }

        var result = [];
        for(var i = 0; i < image.frames.length; i++) {
            var data = image.frames[i].data;
            var r = [];
            for(var j = 0; j < data.length; j += 4) {
                r.push({
                    r   : data.readUInt8(i),
                    g   : data.readUInt8(i + 1),
                    b   : data.readUInt8(i + 2),
                    a   : data.readUInt8(i + 3)
                });
            }
            result.push(r);
        }

        callback(undefined, result);
    })
};

module.exports = GIFGetter;
