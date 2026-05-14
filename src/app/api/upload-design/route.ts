import { imagekit } from "@/lib/imagekit";

export async function POST(req: Request) {
  const { dataUrl, filename } = await req.json();

  if (!dataUrl) {
    return Response.json({ error: "dataUrl is required" }, { status: 400 });
  }

  try {
    const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
    const result = await imagekit.upload({
      file: base64,
      fileName: filename ?? `design-${Date.now()}.png`,
      folder: "/qikink-designs",
      useUniqueFileName: true,
    });
    return Response.json({ url: result.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
