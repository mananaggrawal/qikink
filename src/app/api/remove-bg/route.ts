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

  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "REMOVE_BG_API_KEY is not configured" }, { status: 500 });
  }

  try {
    // Pass as public URL or base64 depending on input type
    const body = imageUrl.startsWith("data:")
      ? new URLSearchParams({ image_file_b64: imageUrl.split(",")[1], size: "auto", format: "png" })
      : new URLSearchParams({ image_url: imageUrl, size: "auto", format: "png" });

    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      return Response.json({ error: `remove.bg error: ${res.status} ${text}` }, { status: res.status });
    }

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const result = await cloudinary.uploader.upload(`data:image/png;base64,${base64}`, {
      folder: "qikink-nobg",
    });

    return Response.json({ dataUrl: result.secure_url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Background removal failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
