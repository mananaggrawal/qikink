import { createHmac } from "crypto";

export async function POST(req: Request) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return Response.json({ error: "Missing required payment verification fields" }, { status: 400 });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET!;
  const expectedSignature = createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return Response.json({ error: "Payment signature verification failed" }, { status: 400 });
  }

  return Response.json({ verified: true, paymentId: razorpay_payment_id });
}
