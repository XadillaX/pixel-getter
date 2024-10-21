import { Decoder as GifDecoder } from '@chi_eee/gif-decoder';
import { createJimp } from '@jimp/core';
import { defaultFormats, defaultPlugins } from 'jimp';

const formats = [...defaultFormats.filter(f => f.name !== 'gif')];
formats.push(
  () =>
    ({
      mime: 'image/gif',
      encode: async () => {
        // placeholder
        return Buffer.alloc(0);
      },
      decode: async (data: Buffer) => {
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
    } as any)
);

export const Jimp = createJimp({
  plugins: defaultPlugins,
  formats,
});
