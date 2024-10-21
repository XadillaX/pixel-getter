declare module 'readimage' {
  interface Frame {
    data: Buffer;
    delay: number | undefined;
  }

  export interface Image {
    height: number;
    width: number;
    frames: Frame[];
  }

  type Callback = (err: null | Error, image: err extends null ? undefined : Image) => void;

  const read: (data: Buffer, callback: Callback) => void;
  export = read;
}
