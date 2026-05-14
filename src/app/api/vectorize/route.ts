import potrace from "potrace";
import { uploadToImageKit } from "@/lib/imagekit";

function traceToSvg(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    potrace.posterize(
      buffer,
      { steps: 3, fillStrategy: "spread" as never },
      (err: Error | null, svg: string) => {
        if (err) reject(err);
        else resolve(svg);
      }
    );
  });
}

export async function POST(req: Request) {
  const { imageUrl } = await req.json();
  if (!imageUrl) {
    return Response.json({ error: "imageUrl is required" }, { status: 400 });
  }

  try {
    const imgRes = await fetch(imageUrl);
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

    const svg = await traceToSvg(imgBuffer);

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
