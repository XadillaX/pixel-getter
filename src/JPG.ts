import { decode } from 'jpeg-js';

import { Getter, PixelGetterCallback, RGB } from './Getter';

export default class JPGGetter extends Getter<RGB, false> {
  private _parse(rawImageData: ReturnType<typeof decode>) {
    let rgb: RGB;
    const result: RGB[] = [];
    for (let i = 0; i < rawImageData.data.length; i += 4) {
      rgb = {
        r: rawImageData.data[i],
        g: rawImageData.data[i + 1],
        b: rawImageData.data[i + 2],
      };
      result.push(rgb);
    }

    return result;
  }

  parse(callback: PixelGetterCallback<RGB, false>) {
    let rawImageData: ReturnType<typeof decode>;
    try {
      rawImageData = decode(this.buffer);
    } catch (e) {
      return callback(e);
    }

    let result: RGB[];
    try {
      result = this._parse(rawImageData);
    } catch (e) {
      return callback(e);
    }

    callback(undefined, [ result ]);
  }
}
