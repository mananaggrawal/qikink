import potrace from "potrace";
import { imagekit } from "@/lib/imagekit";

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

    const result = await imagekit.upload({
      file: Buffer.from(svg).toString("base64"),
      fileName: `vectorized-${Date.now()}.svg`,
      folder: "/qikink-vectorized",
      useUniqueFileName: true,
    });

    return Response.json({ url: result.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Vectorization failed";
    console.error("[vectorize]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
