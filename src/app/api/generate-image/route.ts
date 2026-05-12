import { GoogleGenAI, Modality } from "@google/genai";
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

  const enhancedPrompt = `Flat graphic artwork only, isolated on a plain white background, no clothing, no t-shirt, no apparel, no product mockup — just the design itself. Bold and clear composition, suitable for direct screen printing: ${prompt}`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: enhancedPrompt,
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData?.data);

    if (!imagePart?.inlineData?.data) {
      throw new Error("No image returned from Gemini");
    }

    const { data: base64, mimeType = "image/png" } = imagePart.inlineData;

    const result = await cloudinary.uploader.upload(`data:${mimeType};base64,${base64}`, {
      folder: "qikink-generated",
      eager: [{ effect: "vectorize", format: "png" }],
      eager_async: false,
    });

    const imageUrl = result.eager?.[0]?.secure_url ?? result.secure_url;
    return Response.json({ imageUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Image generation failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
