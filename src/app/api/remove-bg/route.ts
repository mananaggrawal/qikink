
export async function POST(req: Request) {
  const { imageUrl } = await req.json();

  if (!imageUrl) {
    return Response.json({ error: "imageUrl is required" }, { status: 400 });
  }

  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "REMOVE_BG_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    let body: URLSearchParams;

    if (imageUrl.startsWith("data:")) {
      const base64 = imageUrl.split(",")[1];
      body = new URLSearchParams({ image_file_b64: base64, size: "auto", format: "png" });
    } else {
      body = new URLSearchParams({ image_url: imageUrl, size: "auto", format: "png" });
    }

    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      return Response.json(
        { error: `remove.bg error: ${res.status} ${text}` },
        { status: res.status }
      );
    }

    const buffer = await res.arrayBuffer();
    const resultBase64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:image/png;base64,${resultBase64}`;

    return Response.json({ dataUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Background removal failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
