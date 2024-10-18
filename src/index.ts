import * as fs from 'fs';

import * as Getter from './Getter';
import imageType from 'image-type';
import * as spidex from 'spidex';

type CallbackType<N> =
  N extends keyof Getter.FactoryMap ?
    Getter.FactoryMap[N] extends Getter.Getter<infer C, infer M> ?
      Getter.PixelGetterCallback<C, M> :
      Getter.PixelGetterCallback<Getter.RGB | Getter.RGBA, boolean> :
    Getter.PixelGetterCallback<Getter.RGB | Getter.RGBA, boolean>;

function _get<N extends keyof Getter.FactoryMap>(buff: Buffer, callback: CallbackType<N>, frames: [ number, number ]) {
  const type = imageType(buff);
  if (!type) {
    process.nextTick(() => {
      callback(new Error('Not an image type.'));
    });
    return;
  }

  let getter: Getter.FactoryMap[N] extends Getter.Getter<any, any> ?
    Getter.FactoryMap[N] :
    Getter.Getter<Getter.RGB | Getter.RGBA, boolean>;
  switch (type.ext) {
    case 'gif':
      getter = Getter.createGetter('GIF', buff) as any;
      break;

    case 'jpg':
      getter = Getter.createGetter('JPG', buff) as any;
      break;

    case 'png':
      getter = Getter.createGetter('PNG', buff) as any;
      break;

    default:
      process.nextTick(() => {
        callback(new Error(`Image type ${type.ext} is not supported.`));
      });
      return;
  }

  process.nextTick(() => {
    getter.parse(callback, frames);
  });
}

type PromiseGetType<N extends (keyof Getter.FactoryMap | any)> = (
  N extends keyof Getter.FactoryMap ?
    Getter.FactoryMap[N] extends Getter.Getter<infer C> ?
      C :
      Getter.RGB | Getter.RGBA :
    Getter.RGB | Getter.RGBA)[][];

export function get<N extends (keyof Getter.FactoryMap | any)>(
  url: string,
  callback: CallbackType<N>,
  frames?: number | [ number, number ],
  timeout?: number
): void;

export function get<N extends (keyof Getter.FactoryMap | any)>(
  url: string,
  frames?: number | [ number, number ],
  timeout?: number
): Promise<PromiseGetType<N>>;

export function get<N extends (keyof Getter.FactoryMap | any)>(
  buff: Buffer,
  callback: CallbackType<N>,
  frames?: number | [ number, number ],
  timeout?: number
): void;

export function get<N extends (keyof Getter.FactoryMap | any)>(
  buff: Buffer,
  frames?: number | [ number, number ],
  timeout?: number
): Promise<PromiseGetType<N>>;

export function get<N extends (keyof Getter.FactoryMap | any)>(
  url: string | Buffer,
  callback?: CallbackType<N> | number | [ number, number ],
  frames?: number | [ number, number ],
  timeout?: number
): Promise<PromiseGetType<N>> | void {
  const usePromise = typeof callback !== 'function';
  let promise: Promise<PromiseGetType<N>> | undefined = undefined;

  if (usePromise) {
    timeout = frames as number;
    frames = callback as [ number, number ];

    let resolve;
    let reject;
    promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    callback = ((err, pix) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(pix);
      return;
    }) as any;
  }

  if (frames === undefined) frames = [ 0, 0 ];
  if (typeof frames === 'number') frames = [ frames, frames ];

  if (Buffer.isBuffer(url)) {
    _get(url, callback as CallbackType<N>, frames);
    return promise;
  }

  if (url.indexOf('://') !== -1) {
    spidex.get(url, {
      charset: 'binary',
      timeout,
    }, buff => {
      _get(buff, callback as CallbackType<N>, frames as [ number, number ]);
    }).on('error', callback as CallbackType<N>);
    return promise;
  }

  fs.readFile(url, (err, data) => {
    if (err) {
      (callback as CallbackType<N>)(err);
    } else {
      _get(data, callback as CallbackType<N>, frames as [ number, number ]);
    }
  });

  return promise;
}

export {
  RGB,
  RGBA,
  PixelGetterCallback
} from './Getter';
