/**
 * XadillaX created at 2014-09-16 11:36
 *
 * Copyright (c) 2014 Huaban.com, all rights
 * reserved.
 */
var getter = require("../");
getter.get("https://raw.githubusercontent.com/eugeneware/jpeg-js/master/test/fixtures/unconventional-table.jpg", function(err, pixels) {
    if(err) {
        return console.log(err);
    }
    console.log(pixels);
});
