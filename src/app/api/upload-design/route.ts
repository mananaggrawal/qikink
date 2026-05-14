import { uploadToImageKit } from "@/lib/imagekit";

export async function POST(req: Request) {
  const { dataUrl, filename } = await req.json();

  if (!dataUrl) {
    return Response.json({ error: "dataUrl is required" }, { status: 400 });
  }

  try {
    const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
    const url = await uploadToImageKit(
      base64,
      filename ?? `design-${Date.now()}.png`,
      "/qikink-designs"
    );
    return Response.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
