# Pixel Getter

[![npm version](https://img.shields.io/npm/v/pixel-getter.svg)](https://npmjs.org/pixel-getter)
[![npm downloads](https://img.shields.io/npm/dm/pixel-getter.svg)](https://npmjs.org/pixel-getter)
[![Build Status](https://github.com/XadillaX/pixel-getter/workflows/Node.js%20CI/badge.svg)](https://github.com/XadillaX/pixel-getter/actions)
[![Coverage Status](https://img.shields.io/coveralls/XadillaX/pixel-getter/master.svg)](https://coveralls.io/github/XadillaX/pixel-getter?branch=master)

Pixel Getter is a powerful tool for retrieving image pixel information in Node.js. It supports various image formats and provides both Promise-based and callback-based APIs for flexibility.

## Installation

To install Pixel Getter, run the following command:

```sh
$ npm install --save pixel-getter
```

## Usage

Pixel Getter currently supports the following image formats: `JPG`, `PNG`, and `GIF`.

### Basic Usage

First, require the Pixel Getter module:

```js
const pixelGetter = require('pixel-getter');
```

You can pass an **image buffer**, **local filename**, or **remote URL** to retrieve pixel information.

#### Using Promises

```js
const ret = await getter.get("eg.jpg");
const ret = await getter.get(new Buffer(...));
const ret = await getter.get("https://nodejs.org/images/logo-light.png");
```

#### Using Callbacks

```js
getter.get("eg.jpg", function(err, pixels) {
  if (err) {
    console.error(err);
  } else {
    console.log(pixels);
  }
});

getter.get(new Buffer(...), function(err, pixels) {
  if (err) {
    console.error(err);
  } else {
    console.log(pixels);
  }
});

getter.get("https://nodejs.org/images/logo-light.png", function(err, pixels) {
  if (err) {
    console.error(err);
  } else {
    console.log(pixels);
  }
});
```

#### Pixel Information

The `pixels` argument passed to your callback function or the promise result is a two-dimensional array. For example:

```json
[
  [ { "r": 0, "g": 0, "b": 0, "a": 0 } ]
]
```

- `pixels[0][0]` represents the first pixel in the first frame.
- `JPG` and `PNG` files always have only one frame.

### GIF Support

When working with GIF files, you can specify the optional `frames` parameter, which can be a single number or an array containing the starting and ending frames.

#### Using Promises

```js
const ret = await getter.get("foo.gif", 0);
const ret = await getter.get("foo.gif", [0, 1]);
```

#### Using Callbacks

```js
getter.get("foo.gif", function(err, pixels) {
  if (err) {
    console.error(err);
  } else {
    console.log(pixels);
  }
}, 0);

getter.get("foo.gif", function(err, pixels) {
  if (err) {
    console.error(err);
  } else {
    console.log(pixels);
  }
}, [0, 1]);
```

### Timeout Setting

You can also set a timeout for downloading remote images:

```js
getter.get("http://foo/bar.jpg", function(err, pixels) {
  if (err) {
    console.error(err);
  } else {
    console.log(pixels);
  }
}, 10000); // 10000ms is the max time
```

## Contributing

We welcome contributions! Feel free to fork the repository and submit pull requests.
