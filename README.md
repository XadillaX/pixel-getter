# Pixel Getter

[![npm version](https://img.shields.io/npm/v/pixel-getter.svg)](https://npmjs.org/pixel-getter)
[![npm downloads](https://img.shields.io/npm/dm/pixel-getter.svg)](https://npmjs.org/pixel-getter)
[![Build Status](https://github.com/XadillaX/pixel-getter/workflows/Node.js%20CI/badge.svg)](https://github.com/XadillaX/pixel-getter/actions)
[![Coverage Status](https://img.shields.io/coveralls/XadillaX/pixel-getter/master.svg)](https://coveralls.io/github/XadillaX/pixel-getter?branch=master)

Pixel Getter is a powerful Node.js tool designed to extract pixel information from images. It offers support for various image formats and provides both Promise-based and callback-style APIs to cater to diverse programming preferences.

## Important Notice: Breaking Changes

**Version 4 introduces significant updates and breaking changes. If you're upgrading from v3, please carefully review the new usage instructions.**

## Installation

To incorporate Pixel Getter into your project, execute the following command:

```sh
$ npm install --save pixel-getter
```

## Usage

Pixel Getter currently supports the following image formats: `JPG`, `PNG`, and `GIF`.

### Basic Usage

Begin by importing the Pixel Getter module:

```js
const pixelGetter = require('pixel-getter');
```

You can retrieve pixel information by providing an **image buffer**, **local filename**, or **remote URL**.

#### Promise-based Approach

```js
const result = await pixelGetter.get("example.jpg");
const result = await pixelGetter.get(Buffer.from(...));
const result = await pixelGetter.get("https://nodejs.org/images/logo-light.png");
```

#### Callback-based Approach

```js
pixelGetter.get("example.jpg", (err, pixels) => {
  if (err) {
    console.error(err);
  } else {
    console.log(pixels);
  }
});

pixelGetter.get(Buffer.from(...), (err, pixels) => {
  if (err) {
    console.error(err);
  } else {
    console.log(pixels);
  }
});

pixelGetter.get("https://nodejs.org/images/logo-light.png", (err, pixels) => {
  if (err) {
    console.error(err);
  } else {
    console.log(pixels);
  }
});
```

### Options

Pixel Getter allows you to customize its behavior using an `options` object. Here's the structure of the options object:

```typescript
interface PixelGetterOptions<Type extends PixelType = PixelType.AUTO> {
  pixelType?: Type;
  frames?: number | [number, number];
  timeout?: number;
}
```

- `pixelType`: Specifies the desired pixel type (RGB or RGBA) for the returned data.
- `frames`: For GIF images, specifies which frame(s) to process. Can be a single number or an array of two numbers representing the start and end frames.
- `timeout`: Sets a timeout (in milliseconds) for remote image retrieval.

You can pass the options object as the second argument in both Promise-based and callback-based approaches:

```js
// Promise-based with options
const result = await pixelGetter.get('example.jpg', {
  pixelType: pixelGetter.PixelType.RGB,
  timeout: 5000,
});

// Callback-based with options
pixelGetter.get(
  'animation.gif',
  {
    frames: [0, 5],
    pixelType: pixelGetter.PixelType.RGBA,
  },
  (err, pixels) => {
    if (err) {
      console.error(err);
    } else {
      console.log(pixels);
    }
  }
);
```

#### Pixel Information Structure

The returned `pixels` object contains the following information:

```typescript
interface PixelInfo {
  width: number;
  height: number;
  pixelsCount: number;
  pixels: (RGB[] | RGBA[])[];
  pixelType: PixelType.RGB | PixelType.RGBA;
}
```

- `pixels[0]` represents the pixel array of the first frame.
- `JPG` and `PNG` files always contain a single frame.

### GIF Support

When working with GIF files, you can specify an optional `frames` parameter in the options object. This can be either a single number or an array containing the start and end frame indices.

#### Promise-based GIF Processing

```js
const result = await pixelGetter.get('animation.gif', { frames: 0 });
const result = await pixelGetter.get('animation.gif', { frames: [0, 1] });
```

#### Callback-based GIF Processing

```js
pixelGetter.get('animation.gif', { frames: 0 }, (err, pixels) => {
  if (err) {
    console.error(err);
  } else {
    console.log(pixels);
  }
});

pixelGetter.get('animation.gif', { frames: [0, 1] }, (err, pixels) => {
  if (err) {
    console.error(err);
  } else {
    console.log(pixels);
  }
});
```

### Timeout Configuration

For remote image retrieval, you can set a timeout duration using the `timeout` option:

```js
pixelGetter.get(
  'http://example.com/image.jpg',
  { timeout: 10000 },
  (err, pixels) => {
    if (err) {
      console.error(err);
    } else {
      console.log(pixels);
    }
  }
);
```

### Pixel Type Specification

You can specify the desired pixel type (RGB or RGBA) for the returned data using the `pixelType` option:

```js
const result = await pixelGetter.get('example.jpg', {
  pixelType: pixelGetter.PixelType.RGB,
});
```

### Raw Pixel Data Retrieval

In addition to the `get` function, Pixel Getter also provides a `getRaw` function that returns raw pixel data as a Buffer. This can be useful for more advanced image processing tasks or when you need to work with the raw binary data directly.

#### Promise-based Raw Data Retrieval

```js
const rawResult = await pixelGetter.getRaw("example.jpg");
const rawResult = await pixelGetter.getRaw(Buffer.from(...));
const rawResult = await pixelGetter.getRaw("https://nodejs.org/images/logo-light.png");
```

#### Callback-based Raw Data Retrieval

```js
pixelGetter.getRaw('example.jpg', (err, rawPixels) => {
  if (err) {
    console.error(err);
  } else {
    console.log(rawPixels);
  }
});
```

The `getRaw` function accepts the same options as the `get` function:

```js
const rawResult = await pixelGetter.getRaw('example.jpg', {
  pixelType: pixelGetter.PixelType.RGB,
  timeout: 5000,
});
```

The returned `rawPixels` object has the following structure:

```typescript
interface RawPixelInfo {
  width: number;
  height: number;
  pixelsCount: number;
  pixels: Buffer[];
  pixelType: PixelType.RGB | PixelType.RGBA;
}
```

Note that `pixels` is an array of Buffers, where each Buffer represents the raw pixel data for a frame.

## Contributing

We warmly welcome contributions to Pixel Getter! Feel free to fork the repository and submit pull requests to help improve this tool.
