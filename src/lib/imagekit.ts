// eslint-disable-next-line @typescript-eslint/no-require-imports
const ImageKitLib = require("imagekit");
// imagekit is a CJS package — the constructor may be on .default or the export itself
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ImageKitClass = (ImageKitLib.default ?? ImageKitLib) as new (opts: any) => InstanceType<typeof import("imagekit")>;

export const imagekit = new ImageKitClass({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});
