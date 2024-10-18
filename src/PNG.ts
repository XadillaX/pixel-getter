import { decode } from '@cf-wasm/png/node';

import { Getter, PixelGetterCallback, RGBA } from './Getter';

export default class PNGGetter extends Getter<RGBA, false> {
  private _parse(rawImageData: Uint8Array, step: number) {
    const result: RGBA[] = [];
    for (let i = 0; i < rawImageData.length; i += step) {
      result.push({
        r: rawImageData[i],
        g: rawImageData[i + 1],
        b: rawImageData[i + 2],
        a: step === 3 ? 255 : rawImageData[i + 3],
      });
    }
    return result;
  }

  parse(callback: PixelGetterCallback<RGBA, false>) {
    (async () => {
      let image: ReturnType<typeof decode>;

      try {
        image = decode(this.buffer);
      } catch (e) {
        return callback(e);
      }

      let result: RGBA[];
      try {
        result = this._parse(image.image, image.image.length / (image.width * image.height));
      } catch (e) {
        return callback(e);
      }

      callback(undefined, [ result ]);
    })();
  }
}
