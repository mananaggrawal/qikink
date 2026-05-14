export async function POST(req: Request) {
  const { imageUrl } = await req.json();
  if (!imageUrl) {
    return Response.json({ error: "imageUrl is required" }, { status: 400 });
  }
  // Return the bg-removed PNG as-is — transparent PNG renders correctly in the
  // mockup canvas and Qikink receives the bgRemovedImageUrl (with white bg) for print.
  return Response.json({ url: imageUrl });
}
