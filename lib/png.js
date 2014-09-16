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
 * @param callback
 */
PNGGetter.prototype.parse = function(callback) {
    var png = new PNG(this.buffer);

    try {
        png.decode(function(pixels) {
            // RGBA -> RGB
            var rgb;
            var a;
            var result = [];
            for(var i = 0; i < pixels.length; i += 4) {
                rgb = {
                    r   : pixels.readUInt8(i),
                    g   : pixels.readUInt8(i + 1),
                    b   : pixels.readUInt8(i + 2),
                    a   : pixels.readUInt8(i + 3)
                };
                /**a = pixels.readUInt8(i + 3);
                if(a !== 255) {
                    rgb.r *= (a / 255);
                    rgb.g *= (a / 255);
                    rgb.b *= (a / 255);
                    rgb.r = parseInt(rgb.r);
                    rgb.g = parseInt(rgb.g);
                    rgb.b = parseInt(rgb.b);
                }*/

                result.push(rgb);
            }
            callback(undefined, [ result ]);
        });
    } catch(err) {
        callback(err);
    }
};

module.exports = PNGGetter;
