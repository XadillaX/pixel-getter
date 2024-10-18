import { Image } from 'readimage';
import readimage = require('readimage');

import { Getter, PixelGetterCallback, RGBA } from './Getter';

export default class GIFGetter extends Getter<RGBA, true> {
  private _parse(image: Image, frames: [number, number]) {
    const result: RGBA[][] = [];

    const [ min, max ] = frames;
    if (min < 0 || min > image.frames.length - 1) {
      throw new Error(`Invalid frame index: ${min}`);
    }

    if (max < 0 || max > image.frames.length - 1) {
      throw new Error(`Invalid frame index: ${max}`);
    }

    for (let i = min; i <= max; i++) {
      const { data } = image.frames[i];
      const r: RGBA[] = [];
      for (let j = 0; j < data.length; j += 4) {
        r.push({
          r: data[j],
          g: data[j + 1],
          b: data[j + 2],
          a: data[j + 3],
        });
      }

      result.push(r);
    }

    return result;
  }

  parse(callback: PixelGetterCallback<RGBA, true>, frames: [number, number]) {
    readimage(this.buffer, (err, image) => {
      if (err) {
        return callback(err);
      }

      let result: RGBA[][];
      try {
        result = this._parse(image as Image, frames);
      } catch (e) {
        return callback(e);
      }

      callback(undefined, result);
    });
  }
}
