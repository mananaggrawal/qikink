import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const body = await req.json();
  const { amount, currency = "INR" } = body;

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return Response.json({ error: "Valid amount in paise is required" }, { status: 400 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID!;
  const keySecret = process.env.RAZORPAY_KEY_SECRET!;
  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  try {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt: `rcpt_${randomUUID().slice(0, 8)}`,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.description ?? "Failed to create Razorpay order");
    }

    return Response.json({ id: data.id, amount: data.amount, currency: data.currency });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Razorpay order creation failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
