import { decode } from '@cf-wasm/png/node'; // eslint-disable-line import/no-unresolved

import { Getter, ParseReturnType, PixelType, RGB, RGBA } from './Getter';

export default class PNGGetter extends Getter {
  async parseRaw(frames: [number, number], type: PixelType.RGB): Promise<ParseReturnType<Buffer, PixelType.RGB>>;

  async parseRaw(frames: [number, number], type: PixelType.RGBA): Promise<ParseReturnType<Buffer, PixelType.RGBA>>;

  async parseRaw(frames: [number, number], type?: PixelType): Promise<ParseReturnType<Buffer>>;

  async parseRaw(frames: [number, number], type: PixelType = PixelType.AUTO) {
    if (frames[0] !== 0 || frames[1] !== 0) {
      throw new Error('PNG only support frame 0');
    }

    const image = decode(this.buffer);
    const rawStep = image.image.length / (image.width * image.height);
    const ret: Partial<ParseReturnType<Buffer, any>> = {
      width: image.width,
      height: image.height,
      pixelsCount: image.width * image.height,
    };

    if (type === PixelType.AUTO) {
      ret.pixels = [Buffer.from(image.image)];

      if (rawStep === 3) {
        ret.pixelType = PixelType.RGB;
        return ret as ParseReturnType<Buffer, PixelType.RGB>;
      } else if (rawStep === 4) {
        ret.pixelType = PixelType.RGBA;
        return ret as ParseReturnType<Buffer, PixelType.RGBA>;
      }
      throw new Error('Invalid step');
    }

    if (type === PixelType.RGB && rawStep === 3) {
      ret.pixels = [Buffer.from(image.image)];
      ret.pixelType = PixelType.RGB;
      return ret as ParseReturnType<Buffer, PixelType.RGB>;
    } else if (type === PixelType.RGBA && rawStep === 4) {
      ret.pixels = [Buffer.from(image.image)];
      ret.pixelType = PixelType.RGBA;
      return ret as ParseReturnType<Buffer, PixelType.RGBA>;
    }

    const buff = Buffer.alloc(image.width * image.height * (type === PixelType.RGBA ? 4 : 3));
    ret.pixels = [buff];
    if (type === PixelType.RGB) {
      ret.pixelType = PixelType.RGB;
      for (let i = 0; i < image.image.length; i += 4) {
        buff.writeUInt8(image.image[i], (i / 4) * 3);
        buff.writeUInt8(image.image[i + 1], (i / 4) * 3 + 1);
        buff.writeUInt8(image.image[i + 2], (i / 4) * 3 + 2);
      }

      return ret as ParseReturnType<Buffer, PixelType.RGB>;
    } else if (type === PixelType.RGBA) {
      ret.pixelType = PixelType.RGBA;
      for (let i = 0; i < image.image.length; i += 3) {
        buff.writeUInt8(image.image[i], i);
        buff.writeUInt8(image.image[i + 1], i + 1);
        buff.writeUInt8(image.image[i + 2], i + 2);
        buff.writeUInt8(0xff, i + 3);
      }

      return ret as ParseReturnType<Buffer, PixelType.RGBA>;
    }

    throw new Error('Invalid type');
  }

  async parse(frames: [number, number], type: PixelType.RGB): Promise<ParseReturnType<RGB[], PixelType.RGB>>;

  async parse(frames: [number, number], type: PixelType.RGBA): Promise<ParseReturnType<RGBA[], PixelType.RGBA>>;

  async parse(
    frames: [number, number],
    type?: PixelType
  ): Promise<ParseReturnType<RGBA[] | RGB[], PixelType.RGBA | PixelType.RGB>>;

  async parse(frames: [number, number], type: PixelType = PixelType.AUTO) {
    const ret = await this.parseRaw(frames, type);
    return {
      ...ret,
      pixels: [Getter.bufferToPixelObjects(ret.pixels[0], ret.pixelType)],
    };
  }
}
