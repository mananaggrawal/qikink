import { GoogleGenAI } from "@google/genai";
import { uploadToImageKit } from "@/lib/imagekit";

export async function POST(req: Request) {
  const { prompt, referenceImageUrls } = await req.json();

  if (!prompt) {
    return Response.json({ error: "Prompt is required" }, { status: 400 });
  }

  const hasReferences = Array.isArray(referenceImageUrls) && referenceImageUrls.length > 0;

  const enhancedPrompt = `T-shirt print graphic design. Subject: ${prompt}. Style: bold flat vector illustration, vivid solid colors (max 6), thick solid black outline around the entire subject. Background: perfectly flat solid white (#FFFFFF) — no gradients, no shadows, no glow, no texture, no noise. The subject must be clearly separated from the background with a hard crisp edge. Absolutely no clothing, no t-shirt, no garment shown — just the isolated graphic artwork centered on solid white.${hasReferences ? " Match the visual style of the provided reference images." : ""}`;

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
        model: "gemini-2.5-flash-image",
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

    // imageBytes is raw base64 — ImageKit REST API accepts it directly
    const imageUrl = await uploadToImageKit(
      imageBytes,
      `generated-${Date.now()}.png`,
      "/qikink-generated"
    );

    return Response.json({ imageUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Image generation failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
