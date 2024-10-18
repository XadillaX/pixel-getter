import * as fs from 'fs';
import * as net from 'net';
import * as path from 'path';

import { Decoder as GifDecoder } from '@chi_eee/gif-decoder';
import { createJimp } from '@jimp/core';
import { defaultFormats, defaultPlugins } from 'jimp';
import should from 'should';

import * as getter from '../src';

describe('PixelGetter', function() {
  this.timeout(0);

  this.beforeAll(async () => {
    await import('ntss');
  });

  this.afterAll(done => {
    const handles = (process as any)._getActiveHandles();
    for (const handle of handles) {
      if (handle instanceof net.Server) {
        if ((handle.address() as net.AddressInfo).port === 45712) {
          handle.close(() => {
            done();
          });
          break;
        }
      }
    }
  });

  const formats = [ ...defaultFormats.filter(f => f.name !== 'gif') ];
  formats.push(() => ({
    mime: 'image/gif',
    encode: async () => {
      // placeholder
      return Buffer.alloc(0);
    },
    decode: async data => {
      const ret = GifDecoder.decodeBuffer(data);
      const buf = new Uint8Array(ret.lsd.width * ret.lsd.height * 4 * ret.frames.length);
      const frames = ret.decodeFrames();
      for (let i = 0; i < frames.length; i++) {
        frames[i].copy(buf, i * (ret.lsd.width * ret.lsd.height * 4));
      }

      return {
        width: ret.lsd.width,
        height: ret.lsd.height,
        data: buf,
      };
    },
  } as any));

  const Jimp = createJimp({
    plugins: defaultPlugins,
    formats,
  });

  const caseMap = {
    jpg: [ 'test.jpg' ],
    png: [ 'test.png', 'non-alpha.png' ],
    gif: [ 'test.gif'],
  };

  for (const type of Object.keys(caseMap)) {
    describe(type, () => {
      for (const name of caseMap[type]) {
        let image: Awaited<ReturnType<typeof Jimp.read>>;
        const filename = path.join(__dirname, `./assets/${name}`);

        beforeEach(async () => {
          image = await Jimp.read(filename);
        });

        const realCallback = (err: Error | undefined, pixels: getter.RGB[][] | getter.RGBA[][] | undefined) => {
          if (err) {
            throw err;
          }

          should(pixels).be.Array();
          const standard = image.bitmap.data;

          for (let f = 0; f < pixels!.length; f++) {
            const pixel = pixels![f];
            let p: getter.RGBA | getter.RGB;
            for (let i = 0; i < pixel.length; i++) {
              p = pixel[i];
              const s: getter.RGBA | getter.RGB = {
                r: standard[(f * pixel.length * 4) + (i * 4)],
                g: standard[(f * pixel.length * 4) + (i * 4) + 1],
                b: standard[(f * pixel.length * 4) + (i * 4) + 2],
              };

              if ((p as getter.RGBA).a !== undefined) {
                (s as getter.RGBA).a = standard[(f * pixel.length * 4) + (i * 4) + 3];
              }

              p.should.deepEqual(s);
            }
          }
        };

        const callback = (
          done: Mocha.Done,
          err: Error | undefined,
          pixels: getter.RGB[][] | getter.RGBA[][] | undefined,
        ) => {
          try {
            realCallback(err, pixels);
          } catch (e) {
            return done(e);
          }

          done();
        };

        it(`should get pixel data for ${type}: ${name} (Filename)`, done => {
          const args: any[] = [
            filename,
            callback.bind(null, done),
          ];

          if (type === 'gif') {
            args.push([ 0, 2 ]);
          }

          getter.get.call(null, ...args);
        });

        it(`should get pixel data for ${type}: ${name} (Filename Promise)`, async () => {
          const args: [ number, number ][] = [];
          if (type === 'gif') {
            args.push([ 0, 2 ]);
          }
          realCallback(undefined, await getter.get(filename, ...args));
        });

        it(`should get pixel data for ${type}: ${name} (Buffer)`, done => {
          const args: any[] = [
            fs.readFileSync(filename),
            callback.bind(null, done),
          ];

          if (type === 'gif') {
            args.push([ 0, 2 ]);
          }

          getter.get.call(null, ...args);
        });

        it(`should get pixel data for ${type}: ${name} (Buffer Promise)`, async () => {
          const args: [ number, number ][] = [];
          if (type === 'gif') {
            args.push([ 0, 2 ]);
          }
          realCallback(undefined, await getter.get(fs.readFileSync(filename), ...args));
        });

        it(`should get pixel data for ${type}: ${name} (HTTP)`, done => {
          const args: any[] = [
            `http://127.0.0.1:45712/${name}`,
            callback.bind(null, done),
          ];

          if (type === 'gif') {
            args.push([ 0, 2 ]);
          }

          getter.get.call(null, ...args);
        });

        it(`should get pixel data for ${type}: ${name} (HTTP Promise)`, async () => {
          const args: [ number, number ][] = [];
          if (type === 'gif') {
            args.push([ 0, 2 ]);
          }
          realCallback(undefined, await getter.get(`http://127.0.0.1:45712/${name}`, ...args));
        });
      }
    });
  }

  describe('Error', () => {
    it('File not exists (Promise)', async () => {
      try {
        await getter.get('not-exists.png');
      } catch (e) {
        e.message.indexOf('ENOENT').should.not.equal(-1);
        return;
      }

      throw new Error('Should not reach here');
    });

    it('File not exists (callback)', done => {
      getter.get('not-exists.png', err => {
        try {
          err!.message.indexOf('ENOENT').should.not.equal(-1);
        } catch (e) {
          return done(e);
        }

        done();
      });
    });

    it('Not an image type (Promise)', async () => {
      try {
        await getter.get(Buffer.alloc(100));
      } catch (e) {
        e.message.indexOf('Not an image type').should.not.equal(-1);
        return;
      }
    });

    it('Not supported (Promise)', async () => {
      try {
        await getter.get(path.join(__dirname, './assets/not-supported.webp'));
      } catch (e) {
        e.message.indexOf('Image type webp is not supported').should.not.equal(-1);
        return;
      }
    });
  });
});
