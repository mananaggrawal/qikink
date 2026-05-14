import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

function extractPublicId(cloudinaryUrl: string): string {
  const uploadIndex = cloudinaryUrl.indexOf("/upload/");
  if (uploadIndex === -1) throw new Error("Not a valid Cloudinary URL");
  const afterUpload = cloudinaryUrl.slice(uploadIndex + "/upload/".length);
  const withoutVersion = afterUpload.replace(/^v\d+\//, "");
  return withoutVersion.replace(/\.[^/.]+$/, "");
}

export async function POST(req: Request) {
  const { imageUrl } = await req.json();
  if (!imageUrl) {
    return Response.json({ error: "imageUrl is required" }, { status: 400 });
  }

  try {
    const publicId = extractPublicId(imageUrl);
    const url = cloudinary.url(publicId, {
      transformation: [{ effect: "background_removal" }],
      format: "png",
      secure: true,
    });
    return Response.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Background removal failed";
    console.error("[remove-bg]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
