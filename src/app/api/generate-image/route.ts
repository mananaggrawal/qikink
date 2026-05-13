import { GoogleGenAI } from "@google/genai";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (!prompt) {
    return Response.json({ error: "Prompt is required" }, { status: 400 });
  }

  const enhancedPrompt = `T-shirt graphic design, white background, vector illustration style, bold outlines, flat colors, high contrast, sharp edges, print-ready artwork. ${prompt}`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: enhancedPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/png",
      },
    });

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!imageBytes) {
      throw new Error("No image returned from Imagen");
    }

    const rawDataUrl = `data:image/png;base64,${imageBytes}`;

    const result = await cloudinary.uploader.upload(rawDataUrl, {
      folder: "qikink-generated",
      resource_type: "image",
    });

    return Response.json({ imageUrl: result.secure_url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Image generation failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
