let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export async function getQikinkToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const apiUrl = process.env.QIKINK_API_URL ?? "https://sandbox.qikink.com";
  const clientId = process.env.QIKINK_CLIENT_ID;
  const clientSecret = process.env.QIKINK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("QIKINK_CLIENT_ID and QIKINK_CLIENT_SECRET must be set");
  }

  const res = await fetch(`${apiUrl}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ ClientId: clientId, client_secret: clientSecret }),
  });

  if (!res.ok) {
    throw new Error(`Qikink auth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = data.Accesstoken as string;
  tokenExpiresAt = Date.now() + (data.expires_in as number) * 1000;
  return cachedToken;
}
