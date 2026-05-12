import { readdir } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const files = await readdir(uploadsDir);
    const images = files
      .filter((f) => /^generated-.*\.(png|jpg|jpeg)$/i.test(f))
      .sort()
      .reverse()
      .map((f) => `/uploads/${f}`);
    return Response.json({ images });
  } catch {
    return Response.json({ images: [] });
  }
}
