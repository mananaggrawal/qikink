import { getQikinkToken } from "@/lib/qikink";

export async function GET() {
  try {
    const accessToken = await getQikinkToken();
    return Response.json({ accessToken });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Token fetch failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
