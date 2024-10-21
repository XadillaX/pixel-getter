import * as fs from 'fs';
import * as net from 'net';
import * as path from 'path';

import should from 'should';

import * as getter from '../src';
import { Jimp } from './utils/Jimp';

process.on('uncaughtException', err => {
  console.error(err);
});

describe('PixelGetter', function () {
  this.timeout(0);

  before(() => {
    if (fs.existsSync(path.join(__dirname, '../node_modules/ntss/index.js'))) {
      const content = fs.readFileSync(path.join(__dirname, '../node_modules/ntss/index.js'), 'utf8');
      fs.writeFileSync(
        path.join(__dirname, '../node_modules/ntss/index.js'),
        content.replace('lib/show_File', 'lib/show_file')
      );
    }
    require('ntss');
  });

  after(done => {
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

  const caseMap = {
    jpg: [['test.jpg', getter.PixelType.RGBA]],
    png: [
      ['test.png', getter.PixelType.RGBA],
      ['non-alpha.png', getter.PixelType.RGBA],
    ],
    gif: [['test.gif', getter.PixelType.RGBA]],
  } as {
    [key: string]: [string, getter.PixelType][];
  };

  for (const type of Object.keys(caseMap)) {
    describe(type, () => {
      for (const [name, defaultType] of caseMap[type]) {
        let image: Awaited<ReturnType<typeof Jimp.read>>;
        const filename = path.join(__dirname, `./assets/${name}`);

        beforeEach(async () => {
          image = await Jimp.read(filename);
        });

        const realCallback: getter.PixelObjectCallback<getter.PixelType> = (err, pix) => {
          if (err) {
            throw err;
          }

          pix?.height.should.equal(image.height);
          pix?.width.should.equal(image.width);
          pix?.pixelsCount.should.equal(image.width * image.height);
          pix?.pixelType.should.equal(defaultType);

          const standard = image.bitmap.data;
          should(pix?.pixels).be.an.Array();

          for (let f = 0; f < pix!.pixels.length; f++) {
            const pixel = pix!.pixels[f];
            let p: getter.RGBA | getter.RGB;
            for (let i = 0; i < pixel.length; i++) {
              p = pixel[i];
              const s: getter.RGBA | getter.RGB = {
                r: standard[f * pixel.length * 4 + i * 4],
                g: standard[f * pixel.length * 4 + i * 4 + 1],
                b: standard[f * pixel.length * 4 + i * 4 + 2],
              };

              if ((p as getter.RGBA).a !== undefined) {
                (s as getter.RGBA).a = standard[f * pixel.length * 4 + i * 4 + 3];
              }

              p.should.deepEqual(s);
            }
          }
        };

        const callback: <T extends getter.PixelType>(
          done: Mocha.Done,
          ...args: Parameters<getter.PixelObjectCallback<T>>
        ) => ReturnType<getter.PixelObjectCallback> = (done, err, pix) => {
          try {
            realCallback(err, pix);
          } catch (e) {
            return done(e);
          }
          done();
        };

        it(`should get pixel data for ${type}: ${name} (Filename)`, done => {
          const args: any[] = [filename];

          if (type === 'gif') {
            args.push({
              frames: [0, 2],
            });
          }
          args.push(callback.bind(null, done));

          getter.get.call(null, ...args);
        });

        it(`should get pixel data for ${type}: ${name} (Filename Promise)`, async () => {
          const args: getter.PixelGetterOptions[] = [];
          if (type === 'gif') {
            args.push({
              frames: [0, 2],
            });
          }
          realCallback(undefined, await getter.get(filename, ...args));
        });

        it(`should get pixel data for ${type}: ${name} (Buffer)`, done => {
          const args: any[] = [fs.readFileSync(filename)];

          if (type === 'gif') {
            args.push({
              frames: [0, 2],
            });
          }
          args.push(callback.bind(null, done));

          getter.get.call(null, ...args);
        });

        it(`should get pixel data for ${type}: ${name} (Buffer Promise)`, async () => {
          const args: getter.PixelGetterOptions[] = [];
          if (type === 'gif') {
            args.push({
              frames: [0, 2],
            });
          }

          realCallback(undefined, await getter.get(fs.readFileSync(filename), ...args));
        });

        it(`should get pixel data for ${type}: ${name} (HTTP)`, done => {
          const args: any[] = [`http://127.0.0.1:45712/${name}`, callback.bind(null, done)];

          if (type === 'gif') {
            args.push([0, 2]);
          }

          getter.get.call(null, ...args);
        });

        it(`should get pixel data for ${type}: ${name} (HTTP Promise)`, async () => {
          const args: getter.PixelGetterOptions[] = [];
          if (type === 'gif') {
            args.push({
              frames: [0, 2],
            });
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
        e.message.indexOf('Image type WEBP is not supported').should.not.equal(-1);
        return;
      }
    });
  });

  describe('getRaw', () => {
    for (const type of Object.keys(caseMap)) {
      describe(type, () => {
        for (const [name, defaultType] of caseMap[type]) {
          let image: Awaited<ReturnType<typeof Jimp.read>>;
          const filename = path.join(__dirname, `./assets/${name}`);

          beforeEach(async () => {
            image = await Jimp.read(filename);
          });

          const realCallback: getter.RawCallback<getter.PixelType> = (err, pix) => {
            if (err) {
              throw err;
            }

            pix?.height.should.equal(image.height);
            pix?.width.should.equal(image.width);
            pix?.pixelsCount.should.equal(image.width * image.height);
            pix?.pixelType.should.equal(defaultType);

            const standard = image.bitmap.data;
            should(pix?.pixels).be.an.Array();

            const pixelStep = pix!.pixelType === getter.PixelType.RGB ? 3 : 4;
            const standardStep = 4; // Jimp always uses RGBA

            let offset = 0;
            for (let f = 0; f < pix!.pixels.length; f++) {
              const pixel = pix!.pixels[f];
              pixel.should.be.instanceOf(Buffer);

              const frameSize = pix!.width * pix!.height * pixelStep;
              pixel.length.should.equal(frameSize);

              for (let i = 0; i < frameSize; i += pixelStep) {
                const standardIndex = offset + (i / pixelStep) * standardStep;
                pixel[i].should.equal(standard[standardIndex]); // R
                pixel[i + 1].should.equal(standard[standardIndex + 1]); // G
                pixel[i + 2].should.equal(standard[standardIndex + 2]); // B

                if (pixelStep === 4) {
                  pixel[i + 3].should.equal(standard[standardIndex + 3]); // A
                }
              }

              offset += (frameSize / pixelStep) * standardStep;
            }
          };

          const callback: <T extends getter.PixelType>(
            done: Mocha.Done,
            ...args: Parameters<getter.RawCallback<T>>
          ) => ReturnType<getter.RawCallback> = (done, err, pix) => {
            try {
              realCallback(err, pix);
            } catch (e) {
              return done(e);
            }
            done();
          };

          it(`should get raw pixel data for ${type}: ${name} (Filename)`, done => {
            const args: any[] = [filename];

            if (type === 'gif') {
              args.push({
                frames: [0, 2],
              });
            }
            args.push(callback.bind(null, done));

            getter.getRaw.call(null, ...args);
          });

          it(`should get raw pixel data for ${type}: ${name} (Filename Promise)`, async () => {
            const args: getter.PixelGetterOptions[] = [];
            if (type === 'gif') {
              args.push({
                frames: [0, 2],
              });
            }
            realCallback(undefined, await getter.getRaw(filename, ...args));
          });

          it(`should get raw pixel data for ${type}: ${name} (Buffer)`, done => {
            const args: any[] = [fs.readFileSync(filename)];

            if (type === 'gif') {
              args.push({
                frames: [0, 2],
              });
            }
            args.push(callback.bind(null, done));

            getter.getRaw.call(null, ...args);
          });

          it(`should get raw pixel data for ${type}: ${name} (Buffer Promise)`, async () => {
            const args: getter.PixelGetterOptions[] = [];
            if (type === 'gif') {
              args.push({
                frames: [0, 2],
              });
            }

            realCallback(undefined, await getter.getRaw(fs.readFileSync(filename), ...args));
          });

          it(`should get raw pixel data for ${type}: ${name} (HTTP)`, done => {
            const args: any[] = [`http://127.0.0.1:45712/${name}`, callback.bind(null, done)];

            if (type === 'gif') {
              args.push([0, 2]);
            }

            getter.getRaw.call(null, ...args);
          });

          it(`should get raw pixel data for ${type}: ${name} (HTTP Promise)`, async () => {
            const args: getter.PixelGetterOptions[] = [];
            if (type === 'gif') {
              args.push({
                frames: [0, 2],
              });
            }

            realCallback(undefined, await getter.getRaw(`http://127.0.0.1:45712/${name}`, ...args));
          });
        }
      });
    }
  });
});
