import { uploadToImageKit } from "@/lib/imagekit";

export async function POST(req: Request) {
  const { imageUrl } = await req.json();
  if (!imageUrl) {
    return Response.json({ error: "imageUrl is required" }, { status: 400 });
  }

  try {
    // Trigger ImageKit's bg removal transformation and download the result
    const transformUrl = imageUrl.includes("?")
      ? `${imageUrl}&tr=e-bgremove,f-png`
      : `${imageUrl}?tr=e-bgremove,f-png`;

    const res = await fetch(transformUrl);
    if (!res.ok) throw new Error(`ImageKit bg removal failed: ${res.status}`);

    const buffer = Buffer.from(await res.arrayBuffer());
    const base64 = buffer.toString("base64");

    // Re-upload so vectorize gets a fast static URL (not a lazy transformation)
    const url = await uploadToImageKit(base64, `nobg-${Date.now()}.png`, "/qikink-nobg");
    return Response.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Background removal failed";
    console.error("[remove-bg]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
