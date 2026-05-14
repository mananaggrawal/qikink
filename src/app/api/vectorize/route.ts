import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  const { imageUrl } = await req.json();
  if (!imageUrl) {
    return Response.json({ error: "imageUrl is required" }, { status: 400 });
  }

  const apiId = process.env.VECTORIZER_AI_API_ID;
  const apiSecret = process.env.VECTORIZER_AI_API_SECRET;
  if (!apiId || !apiSecret) {
    return Response.json({ error: "VECTORIZER_AI_API_ID / VECTORIZER_AI_API_SECRET not configured" }, { status: 500 });
  }

  try {
    const form = new FormData();
    form.append("image.url", imageUrl);
    form.append("output.file_format", "svg");
    form.append("mode", "test");

    const auth = Buffer.from(`${apiId}:${apiSecret}`).toString("base64");

    const res = await fetch("https://vectorizer.ai/api/v1/vectorize", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}` },
      body: form,
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Vectorizer.AI ${res.status}: ${body}`);
    }

    const svgBuffer = Buffer.from(await res.arrayBuffer());
    const svgDataUrl = `data:image/svg+xml;base64,${svgBuffer.toString("base64")}`;

    const uploaded = await cloudinary.uploader.upload(svgDataUrl, {
      folder: "qikink-vectorized",
      resource_type: "image",
    });

    return Response.json({ url: uploaded.secure_url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Vectorization failed";
    console.error("[vectorize]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
