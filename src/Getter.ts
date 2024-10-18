export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export type PixelGetterCallback<T extends RGB, MultiFrames extends boolean = false> =
  (err: Error | undefined, pixels?: MultiFrames extends false ? [ T[] ] : T[][]) => void;

export class Getter<T extends RGB, MultiFrames extends boolean = false> {
  buffer: Buffer;

  constructor(buffer: Buffer) {
    this.buffer = buffer;
  }

  /* istanbul ignore next */
  parse(
    callback: PixelGetterCallback<T, MultiFrames>,
    // @ts-ignore
    frames?: MultiFrames extends false ? never : [ number, number ]
  ): void {
    process.nextTick(() => {
      callback(new Error('Not implemented'));
    });
  }
}

export interface FactoryMap {
  GIF: import('./GIF').default,
  JPG: import('./JPG').default,
  PNG: import('./PNG').default,
}

export function createGetter<N extends (keyof FactoryMap)>(type: N, buff: Buffer): FactoryMap[N] {
  const mod = require(`./${type}`).default;
  return new mod(buff);
}
