/**
 * XadillaX created at 2014-09-16 11:36
 *
 * Copyright (c) 2014 Huaban.com, all rights
 * reserved.
 */
var getter = require("../");
getter.get("http://xcoder.in/images/background/flandre/p551983_asuka_roze%20danmaku%20flandre_scarlet%20remilia_scarlet%20touhou.jpg", function(err, pixels) {
    if(err) {
        return console.log(err);
    }
    console.log(pixels);
});
