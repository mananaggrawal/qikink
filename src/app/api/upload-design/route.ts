import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  const { dataUrl, filename } = await req.json();

  if (!dataUrl) {
    return Response.json({ error: "dataUrl is required" }, { status: 400 });
  }

  try {
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: "qikink-designs",
      public_id: filename ?? undefined,
      overwrite: false,
    });

    return Response.json({ url: result.secure_url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
