import { decode } from 'jpeg-js';

import { Getter, ParseReturnType, PixelType, RGB, RGBA } from './Getter';

export default class JPGGetter extends Getter {
  async parseRaw(frames: [number, number], type: PixelType.RGB): Promise<ParseReturnType<Buffer, PixelType.RGB>>;

  async parseRaw(
    frames: [number, number],
    type?: PixelType.RGBA | PixelType.AUTO
  ): Promise<ParseReturnType<Buffer, PixelType.RGBA>>;

  async parseRaw(frames: [number, number], type: PixelType): Promise<ParseReturnType<Buffer>>;

  async parseRaw(frames: [number, number], type: PixelType = PixelType.AUTO) {
    if (frames[0] !== 0 || frames[1] !== 0) {
      throw new Error('JPG only support frame 0');
    }

    const rawImageData = decode(this.buffer);
    const data: Buffer = rawImageData.data;

    const retObject: ParseReturnType<Buffer, any> = {
      width: rawImageData.width,
      height: rawImageData.height,
      pixelsCount: rawImageData.width * rawImageData.height,
      pixelType: type === PixelType.RGB ? PixelType.RGB : PixelType.RGBA,
      pixels: null as any as Buffer[],
    };

    if (type !== PixelType.RGB) {
      retObject.pixels = [data];
      return retObject;
    }

    const newRet = Buffer.alloc((data.length / 4) * 3);
    retObject.pixels = [newRet];

    for (let i = 0; i < data.length; i += 4) {
      data.copy(newRet, (i / 4) * 3, i, i + 3);
    }

    return retObject;
  }

  async parse(
    frames: [number, number],
    type?: PixelType.AUTO | PixelType.RGB
  ): Promise<ParseReturnType<RGB[], PixelType.RGB>>;

  async parse(frames: [number, number], type: PixelType.RGBA): Promise<ParseReturnType<RGBA[], PixelType.RGBA>>;

  async parse(
    frames: [number, number],
    type: PixelType
  ): Promise<ParseReturnType<RGBA[] | RGB[], PixelType.RGBA | PixelType.RGB>>;

  async parse(frames: [number, number], type: PixelType = PixelType.RGB) {
    const ret = await this.parseRaw(frames, type);
    return {
      ...ret,
      pixels: [Getter.bufferToPixelObjects(ret.pixels[0], ret.pixelType)],
    };
  }
}
