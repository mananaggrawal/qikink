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
    return Response.json({ error: "REMOVE_BG_API_KEY not configured" }, { status: 500 });
  }

  try {
    const form = new FormData();
    form.append("size", "auto");

    if (imageUrl.startsWith("data:")) {
      // base64 data URL — strip the prefix and send as image_file_b64
      const base64 = imageUrl.split(",")[1];
      form.append("image_file_b64", base64);
    } else {
      form.append("image_url", imageUrl);
    }

    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: form,
    });

    if (!res.ok) {
      const ct = res.headers.get("content-type") ?? "";
      const body = ct.includes("json")
        ? ((await res.json()) as { errors?: { title: string }[] }).errors?.[0]?.title
        : await res.text();
      throw new Error(body || `remove.bg ${res.status}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const dataUrl = `data:image/png;base64,${buffer.toString("base64")}`;

    const uploaded = await cloudinary.uploader.upload(dataUrl, {
      folder: "qikink-nobg",
      resource_type: "image",
    });

    return Response.json({ url: uploaded.secure_url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Background removal failed";
    console.error("[remove-bg]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
