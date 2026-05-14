export async function POST(req: Request) {
  const { imageUrl } = await req.json();
  if (!imageUrl) {
    return Response.json({ error: "imageUrl is required" }, { status: 400 });
  }

  try {
    // Apply ImageKit's AI background removal via URL transformation
    const url = imageUrl.includes("?")
      ? `${imageUrl}&tr=e-bgremove`
      : `${imageUrl}?tr=e-bgremove`;
    return Response.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Background removal failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
