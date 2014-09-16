/**
 * XadillaX created at 2014-09-16 11:36
 *
 * Copyright (c) 2014 Huaban.com, all rights
 * reserved.
 */
var getter = require("../");
getter.get("http://img.hb.aicdn.com/a4bdcf094ff649f7df75ec2bb7c3f3bba5ad53631e9f42-CHoVqn_fw658", function(err, pixels) {
    if(err) {
        return console.log(err);
    }
    console.log(pixels);
});
