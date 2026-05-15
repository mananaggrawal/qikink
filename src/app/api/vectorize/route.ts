import ImageTracer from "imagetracerjs";
import sharp from "sharp";
import { uploadToImageKit } from "@/lib/imagekit";

export async function POST(req: Request) {
  const { imageUrl } = await req.json();
  if (!imageUrl) {
    return Response.json({ error: "imageUrl is required" }, { status: 400 });
  }

  try {
    const imgRes = await fetch(imageUrl);
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

    // Upscale to 2048px, flatten transparency to white, decode to raw RGBA
    const { data, info } = await sharp(imgBuffer)
      .resize(2048, 2048, { fit: "inside", withoutEnlargement: false })
      .flatten({ background: "#FFFFFF" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Max-quality tracing: 32 colors, tight curve thresholds, no path omission
    const imgData = {
      width: info.width,
      height: info.height,
      data: new Uint8ClampedArray(data),
    };
    const svg: string = ImageTracer.imagedataToSVG(imgData, {
      ltres: 1,
      qtres: 1,
      pathomit: 4,
      numberofcolors: 32,
      colorsampling: 2,
      colorquantcycles: 5,
      scale: 1,
      strokewidth: 1,
      blurradius: 0,
      desc: false,
    });

    const svgBase64 = Buffer.from(svg, "utf8").toString("base64");
    const url = await uploadToImageKit(
      svgBase64,
      `vectorized-${Date.now()}.svg`,
      "/qikink-vectorized"
    );
    return Response.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Vectorization failed";
    console.error("[vectorize]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
