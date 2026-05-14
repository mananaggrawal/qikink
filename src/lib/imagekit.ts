const UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

function authHeader() {
  const key = process.env.IMAGEKIT_PRIVATE_KEY!;
  return "Basic " + Buffer.from(key + ":").toString("base64");
}

export async function uploadToImageKit(
  fileBase64: string,
  fileName: string,
  folder: string
): Promise<string> {
  const form = new FormData();
  form.append("file", fileBase64);
  form.append("fileName", fileName);
  form.append("folder", folder);
  form.append("useUniqueFileName", "true");

  const res = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: { Authorization: authHeader() },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ImageKit upload ${res.status}: ${body}`);
  }

  const data = (await res.json()) as { url: string };
  return data.url;
}
