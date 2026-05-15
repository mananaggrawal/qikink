import { removeBackground } from "@imgly/background-removal-node";
import { uploadToImageKit } from "@/lib/imagekit";

export async function POST(req: Request) {
  const { imageUrl } = await req.json();
  if (!imageUrl) {
    return Response.json({ error: "imageUrl is required" }, { status: 400 });
  }

  try {
    const blob = await removeBackground(imageUrl, {
      output: { format: "image/png", quality: 1 },
    });
    const buffer = Buffer.from(await blob.arrayBuffer());
    const base64 = buffer.toString("base64");
    const url = await uploadToImageKit(base64, `nobg-${Date.now()}.png`, "/qikink-nobg");
    return Response.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Background removal failed";
    console.error("[remove-bg]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
