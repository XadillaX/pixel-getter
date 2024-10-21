import { Image } from 'readimage';
import readimage = require('readimage');

import { createDeferred, Getter, ParseReturnType, PixelType, RGB, RGBA } from './Getter';

export default class GIFGetter extends Getter {
  async parseRaw(frames: [number, number], type: PixelType.RGB): Promise<ParseReturnType<Buffer, PixelType.RGB>>;

  async parseRaw(
    frames: [number, number],
    type?: PixelType.RGBA | PixelType.AUTO
  ): Promise<ParseReturnType<Buffer, PixelType.RGBA>>;

  async parseRaw(frames: [number, number], type: PixelType): Promise<ParseReturnType<Buffer>>;

  async parseRaw(frames: [number, number], type: PixelType = PixelType.AUTO) {
    const { promise, resolve, reject } = createDeferred<Image>();
    readimage(this.buffer, (err, image) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(image as Image);
    });
    const image = await promise;

    const [min, max] = frames;
    if (min < 0 || min > image.frames.length - 1) {
      throw new Error(`Invalid frame index: ${min}`);
    }

    if (max < 0 || max > image.frames.length - 1) {
      throw new Error(`Invalid frame index: ${max}`);
    }

    if (min > max) {
      throw new Error(`Invalid frame range: ${min} - ${max}`);
    }

    const pixels: Buffer[] = [];
    for (let i = min; i <= max; i++) {
      const { data } = image.frames[i];
      switch (type) {
        case PixelType.AUTO:
        case PixelType.RGBA:
          pixels.push(data);
          break;

        case PixelType.RGB: {
          const newBuff = Buffer.alloc((data.length / 4) * 3);
          for (let j = 0; j < data.length; j += 4) {
            data.copy(newBuff, (j / 4) * 3, j, j + 3);
          }
          pixels.push(newBuff);
          break;
        }

        default:
          throw new Error(`Invalid type: ${type}`);
      }
    }

    return {
      width: image.width,
      height: image.height,
      pixelsCount: image.width * image.height,
      pixels,
      pixelType: type === PixelType.AUTO ? PixelType.RGBA : type,
    };
  }

  async parse(
    frames: [number, number],
    type: PixelType
  ): Promise<ParseReturnType<RGBA[] | RGB[], PixelType.RGBA | PixelType.RGB>>;

  async parse(
    frames: [number, number],
    type?: PixelType.RGBA | PixelType.AUTO
  ): Promise<ParseReturnType<RGBA[], PixelType.RGBA>>;

  async parse(frames: [number, number], type: PixelType.RGB): Promise<ParseReturnType<RGB[], PixelType.RGB>>;

  async parse(frames: [number, number], type: PixelType = PixelType.RGBA) {
    const ret = await this.parseRaw(frames, type);
    return {
      ...ret,
      pixels: ret.pixels.map(p => Getter.bufferToPixelObjects(p, ret.pixelType)),
    };
  }
}
