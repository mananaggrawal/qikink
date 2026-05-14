import { GoogleGenAI } from "@google/genai";
import { imagekit } from "@/lib/imagekit";

export async function POST(req: Request) {
  const { prompt, referenceImageUrls } = await req.json();

  if (!prompt) {
    return Response.json({ error: "Prompt is required" }, { status: 400 });
  }

  const hasReferences = Array.isArray(referenceImageUrls) && referenceImageUrls.length > 0;

  const enhancedPrompt = `A sticker graphic on a pure white background. Bold vector illustration style, flat colors (max 6), solid black outlines, high contrast. Pure white background only — absolutely no clothing, no t-shirt, no garment, no fabric, no apparel of any kind. Just the isolated graphic centered on white.${hasReferences ? " Use the provided reference images for visual style and content inspiration." : ""} Design: ${prompt}`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    let imageBytes: string;

    if (hasReferences) {
      const parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [
        { text: enhancedPrompt },
      ];

      for (const url of referenceImageUrls.slice(0, 3)) {
        const res = await fetch(url);
        const buf = Buffer.from(await res.arrayBuffer());
        const contentType = res.headers.get("content-type") ?? "image/png";
        parts.push({ inlineData: { mimeType: contentType.split(";")[0].trim(), data: buf.toString("base64") } });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: [{ role: "user", parts }],
        config: { responseModalities: ["IMAGE"] },
      });

      const imagePart = response.candidates?.[0]?.content?.parts?.find(
        (p: { inlineData?: { data?: string } }) => p.inlineData?.data
      );
      if (!imagePart?.inlineData?.data) throw new Error("No image returned from Gemini");
      imageBytes = imagePart.inlineData.data;
    } else {
      const response = await ai.models.generateImages({
        model: "imagen-4.0-generate-001",
        prompt: enhancedPrompt,
        config: { numberOfImages: 1, outputMimeType: "image/png" },
      });
      const bytes = response.generatedImages?.[0]?.image?.imageBytes;
      if (!bytes) throw new Error("No image returned from Imagen");
      imageBytes = bytes;
    }

    const result = await imagekit.upload({
      file: imageBytes,
      fileName: `generated-${Date.now()}.png`,
      folder: "/qikink-generated",
      useUniqueFileName: true,
    });

    return Response.json({ imageUrl: result.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Image generation failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
