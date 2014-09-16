/**
 * XadillaX created at 2014-09-16 11:36
 *
 * Copyright (c) 2014 Huaban.com, all rights
 * reserved.
 */
var getter = require("../");
getter.get("http://nodejs.org/images/logo-light.png", function(err, pixels) {
    if(err) {
        return console.log(err);
    }
    console.log(pixels);
});
