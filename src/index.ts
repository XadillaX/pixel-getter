import * as fs from 'fs';

import { createDeferred, createGetter, ParseReturnType, PixelType, RGB, RGBA } from './Getters/Getter';
import imageType from 'image-type';
import * as spidex from 'spidex';

export interface PixelGetterOptions<Type extends PixelType = PixelType.AUTO> {
  pixelType?: Type;
  frames?: number | [number, number];
  timeout?: number;
}

type CallbackSecondArg<Type extends PixelType, R extends boolean = false> = ParseReturnType<
  R extends true
    ? Buffer
    : R extends boolean
    ? Type extends PixelType.RGB
      ? RGB[]
      : Type extends PixelType.RGBA
      ? RGBA[]
      : RGB[] | RGBA[]
    : never,
  Type
>;

export type RawCallback<Type extends PixelType = PixelType.AUTO> = (
  err: Error | undefined,
  pixels?: CallbackSecondArg<Type, true>
) => void;
export type RawPromise<Type extends PixelType = PixelType.AUTO> = Promise<CallbackSecondArg<Type, true>>;

export type PixelObjectCallback<Type extends PixelType = PixelType.AUTO> = (
  err: Error | undefined,
  pixels?: CallbackSecondArg<Type, false>
) => void;
export type PixelObjectPromise<Type extends PixelType = PixelType.AUTO> = Promise<CallbackSecondArg<Type, false>>;

function nextTick() {
  return new Promise<void>(resolve => {
    process.nextTick(resolve);
  });
}

async function innerGet<R extends boolean>(
  buff: Buffer,
  frames: [number, number],
  returnType: PixelType,
  returnRaw: R
): Promise<CallbackSecondArg<PixelType, R>> {
  const type = imageType(buff);
  if (!type) {
    await nextTick();
    throw new Error('Not an image type.');
  }

  const getter = createGetter(type.ext.toUpperCase(), buff);

  if (returnRaw) {
    return getter.parseRaw(frames, returnType) as any;
  }

  return getter.parse(frames, returnType) as any;
}

function outerGet<Type extends PixelType, R extends boolean>(
  url: string | Buffer,
  returnRaw: R,
  options?:
    | PixelGetterOptions<Type>
    | (R extends true ? RawCallback<Type> : R extends false ? PixelObjectCallback<Type> : RawCallback<Type>),
  callback?: R extends true ? RawCallback<Type> : R extends false ? PixelObjectCallback<Type> : RawCallback<Type>
) {
  if (typeof options === 'function') {
    callback = options;
    options = {
      pixelType: PixelType.AUTO as Type,
    };
  }

  if (!options) {
    options = {
      pixelType: PixelType.AUTO as Type,
    };
  }

  options = {
    pixelType: (options.pixelType || PixelType.AUTO) as Type,
    frames: options.frames || [0, 0],
    timeout: options.timeout || 0,
  };

  if (!Array.isArray(options.frames)) {
    options.frames = [options.frames, options.frames] as [number, number];
  }

  let promise: ReturnType<typeof innerGet<R>> | undefined;
  const usePromise = typeof callback !== 'function';
  if (usePromise) {
    const deferred = createDeferred<Awaited<ReturnType<typeof innerGet<R>>>>();
    promise = deferred.promise;
    callback = ((err: Error, pixels: CallbackSecondArg<Type, R>) => {
      if (err) {
        deferred.reject(err);
        return;
      }

      deferred.resolve(pixels);
    }) as typeof callback;
  }

  const doBuffer = async (buff: Buffer) => {
    let ret: Awaited<ReturnType<typeof innerGet<R>>>;
    try {
      ret = await innerGet(
        buff,
        (options as PixelGetterOptions).frames as [number, number],
        (options as PixelGetterOptions).pixelType as Type,
        returnRaw
      );
    } catch (e) {
      callback!(e);
      return;
    }
    callback!(undefined, ret as any);
  };

  const sourceType = Buffer.isBuffer(url) ? 'buffer' : url.indexOf('://') !== -1 ? 'url' : 'file';
  switch (sourceType) {
    case 'buffer':
      doBuffer(url as Buffer);
      break;

    case 'url':
      spidex
        .get(
          url as string,
          {
            timeout: options.timeout,
            charset: 'binary',
          },
          doBuffer
        )
        .on('error', callback!);
      break;

    case 'file':
      // eslint-disable-next-line node/prefer-promises/fs
      fs.readFile(url as string, (err, buff) => {
        if (err) {
          callback!(err);
          return;
        }
        doBuffer(buff);
      });
      break;

    default:
      throw new Error('Invalid url');
  }

  return promise;
}

export function get<Type extends PixelType = PixelType.AUTO>(
  url: string,
  options: PixelGetterOptions<Type>,
  callback: PixelObjectCallback<Type>
): void;

export function get<Type extends PixelType = PixelType.AUTO>(
  buff: Buffer,
  options: PixelGetterOptions<Type>,
  callback: PixelObjectCallback<Type>
): void;

export function get<Type extends PixelType = PixelType.AUTO>(url: string, callback: PixelObjectCallback<Type>): void;

export function get<Type extends PixelType = PixelType.AUTO>(buff: Buffer, callback: PixelObjectCallback<Type>): void;

export function get<Type extends PixelType = PixelType.AUTO>(
  url: string,
  options?: PixelGetterOptions<Type>
): Promise<CallbackSecondArg<Type, false>>;

export function get<Type extends PixelType = PixelType.AUTO>(
  buff: Buffer,
  options?: PixelGetterOptions<Type>
): Promise<CallbackSecondArg<Type, false>>;

export function get<Type extends PixelType = PixelType.AUTO>(
  url: string | Buffer,
  options?: PixelGetterOptions<Type> | PixelObjectCallback<Type>,
  callback?: PixelObjectCallback<Type>
) {
  return outerGet(url, false, options, callback);
}

export function getRaw<Type extends PixelType = PixelType.AUTO>(
  url: string,
  options: PixelGetterOptions<Type>,
  callback: RawCallback<Type>
): void;

export function getRaw<Type extends PixelType = PixelType.AUTO>(
  buff: Buffer,
  options: PixelGetterOptions<Type>,
  callback: RawCallback<Type>
): void;

export function getRaw<Type extends PixelType = PixelType.AUTO>(url: string, callback: RawCallback<Type>): void;

export function getRaw<Type extends PixelType = PixelType.AUTO>(buff: Buffer, callback: RawCallback<Type>): void;

export function getRaw<Type extends PixelType = PixelType.AUTO>(
  url: string,
  options?: PixelGetterOptions<Type>
): Promise<CallbackSecondArg<Type, true>>;

export function getRaw<Type extends PixelType = PixelType.AUTO>(
  buff: Buffer,
  options?: PixelGetterOptions<Type>
): Promise<CallbackSecondArg<Type, true>>;

export function getRaw<Type extends PixelType = PixelType.AUTO>(
  url: string | Buffer,
  options?: PixelGetterOptions<Type> | RawCallback<Type>,
  callback?: RawCallback<Type>
) {
  return outerGet(url, true, options, callback);
}

export { RGB, RGBA, PixelType } from './Getters/Getter';
