export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA extends RGB {
  a: number;
}

export enum PixelType {
  RGB,
  RGBA,
  AUTO,
}

export interface ParseReturnType<P, T extends PixelType = PixelType.AUTO> {
  width: number;
  height: number;
  pixelsCount: number;
  pixels: P[];
  pixelType: T extends PixelType.RGB
    ? PixelType.RGB
    : T extends PixelType.RGBA
    ? PixelType.RGBA
    : PixelType.RGB | PixelType.RGBA;
}

export class Getter {
  buffer: Buffer;

  constructor(buffer: Buffer) {
    this.buffer = buffer;
  }

  /* istanbul ignore next */
  async parseRaw(
    // @ts-expect-error unused
    frames: [number, number],
    // @ts-expect-error unused
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type: PixelType = PixelType.AUTO
  ): Promise<ParseReturnType<Buffer, any>> {
    throw new Error('Not implemented');
  }

  async parse(frames: [number, number], type: PixelType.RGB): Promise<ParseReturnType<RGB[], PixelType.RGB>>;
  async parse(frames: [number, number], type: PixelType.RGBA): Promise<ParseReturnType<RGBA[], PixelType.RGBA>>;
  async parse(frames: [number, number], type?: PixelType): Promise<ParseReturnType<RGB[] | RGBA[], PixelType>>;
  /* istanbul ignore next */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async parse(
    // @ts-expect-error unused
    frames: [number, number],
    // @ts-expect-error unused
    type: PixelType = PixelType.AUTO
  ): Promise<{
    width: number;
    height: number;
    pixelsCount: number;
    pixels: RGB[][] | RGBA[][];
    pixelType: PixelType.RGB | PixelType.RGBA;
  }> {
    throw new Error('Not implemented');
  }

  static bufferToPixelObjects<T extends PixelType.RGB | PixelType.RGBA>(
    buffer: Buffer,
    type: T
  ): T extends PixelType.RGB ? RGB[] : RGBA[] {
    const step = type === PixelType.RGB ? 3 : 4;
    switch (type) {
      case PixelType.RGB: {
        const ret: RGB[] = [];
        for (let i = 0; i < buffer.length; i += step) {
          ret.push({
            r: buffer[i],
            g: buffer[i + 1],
            b: buffer[i + 2],
          });
        }
        return ret as any;
      }

      case PixelType.RGBA: {
        const ret: RGBA[] = [];
        for (let i = 0; i < buffer.length; i += step) {
          ret.push({
            r: buffer[i],
            g: buffer[i + 1],
            b: buffer[i + 2],
            a: buffer[i + 3],
          });
        }
        return ret as any;
      }

      default:
        throw new Error('Invalid type');
    }
  }
}

export interface FactoryMap {
  GIF: import('./GIF').default;
  JPG: import('./JPG').default;
  PNG: import('./PNG').default;
}

export function createGetter<N extends keyof FactoryMap>(type: N, buff: Buffer): FactoryMap[N];
export function createGetter<N>(type: N, buff: Buffer): Getter;
export function createGetter<N>(type: N, buff: Buffer): Getter {
  let mod: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mod = require(`./${type}`)?.default;
  } catch (e) {
    throw new Error(`Image type ${type} is not supported.`);
  }

  return new mod(buff);
}

export function createDeferred<T>() {
  const deferred = {} as {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (err: Error) => void;
  };

  deferred.promise = new Promise<T>((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred;
}
