# Pixel Getter

Image pixels information getter for node.js.

## Installation

```sh
$ npm install pixel-getter
```

## Usage

Only `jpg / jpeg`, `png`, `gif` format are supported so far.

At first you should require it:

```javascript
var getter = require("pixel-getter");
```

You can pass ***image buffer***, ***local filename*** or even ***remote url*** to get it's pixel information.

```javascript
getter.get("eg.jpg", function(err, pixels) { /** ... */ });
getter.get(new Buffer(...), function(err, pixels) { /** ... */ });
getter.get("http://nodejs.org/images/logo-light.png", function(err, pixels) { /** ... */ });
```

The argument `pixels` to your callback function is a two-dimensional array. Eg:

```json
[
    [ { "r": 0, "g": 0, "b": 0, "a": 0 } ]
]
```

`pixels[0][0]` indicates the first pixel in the first frame. `jpg` and `png` files always have only one frame.

> If you're using GIF format, you may pass the optional parameter `frames` which can be a single number or an array contains
> starting frame and ending frame.
>
> Eg.
>
> ```javascript
> getter.get("foo.gif", function(){}, 1);
> getter.get("foo.gif", function(){}, [ 1, 2 ]);
> ```

You can also set a timeout for downloading:

```javascript
getter.get("http://foo/bar.jpg", function() {}, 1, 10000);
// means 10000ms is the max time
```

## Contribute

You're welcome to fork and pull requests!
