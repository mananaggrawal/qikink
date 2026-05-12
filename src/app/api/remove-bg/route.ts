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

  try {
    // Upload the image (or re-use if already a Cloudinary URL from the same cloud)
    const uploadResult = await cloudinary.uploader.upload(imageUrl, {
      folder: "qikink-nobg",
    });

    // Apply background removal as an eager transformation — blocks until done
    const processed = await cloudinary.uploader.explicit(uploadResult.public_id, {
      type: "upload",
      eager: [{ effect: "background_removal", format: "png" }],
      eager_async: false,
    });

    const bgRemovedUrl = processed.eager?.[0]?.secure_url;
    if (!bgRemovedUrl) throw new Error("Background removal produced no output");

    return Response.json({ dataUrl: bgRemovedUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Background removal failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
