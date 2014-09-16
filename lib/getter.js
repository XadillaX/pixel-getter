/**
 * XadillaX created at 2014-09-16 11:49
 *
 * Copyright (c) 2014 Huaban.com, all rights
 * reserved.
 */
/**
 * base parser
 * @param buffer
 * @constructor
 */
var Getter = function(buffer) {
    this.buffer = buffer;
};

/**
 * parse pixels
 * @param callback
 */
Getter.prototype.parse = function(callback) {
    if(callback !== undefined) process.nextTick(function() {
        callback(new Error("No such getter."));
    });
};

module.exports = Getter;

/**
 * create a new getter
 * @param type
 * @param buff
 * @returns {Getter}
 */
module.exports.createGetter = function(type, buff) {
    var Getter = require("./" + type + ".js");
    return new Getter(buff);
};
