declare module "imagetracerjs" {
  interface ImageData {
    width: number;
    height: number;
    data: Uint8ClampedArray;
  }
  interface Options {
    ltres?: number;
    qtres?: number;
    pathomit?: number;
    numberofcolors?: number;
    colorsampling?: number;
    colorquantcycles?: number;
    scale?: number;
    strokewidth?: number;
    blurradius?: number;
    desc?: boolean;
    [key: string]: unknown;
  }
  const ImageTracer: {
    imagedataToSVG(imgData: ImageData, options?: Options): string;
  };
  export = ImageTracer;
}
