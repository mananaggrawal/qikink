import { uploadToImageKit } from "@/lib/imagekit";

export async function POST(req: Request) {
  const { imageUrl } = await req.json();
  if (!imageUrl) {
    return Response.json({ error: "imageUrl is required" }, { status: 400 });
  }

  try {
    const form = new FormData();
    form.append("image_url", imageUrl);
    form.append("size", "auto");
    form.append("type", "auto");
    form.append("format", "png");

    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": process.env.REMOVE_BG_API_KEY! },
      body: form,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`remove.bg ${res.status}: ${errText}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const base64 = buffer.toString("base64");
    const url = await uploadToImageKit(base64, `nobg-${Date.now()}.png`, "/qikink-nobg");
    return Response.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Background removal failed";
    console.error("[remove-bg]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
