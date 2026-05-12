import { getQikinkToken } from "@/lib/qikink";
import { QikinkOrderPayload } from "@/types";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(req: Request) {
  const payload: Omit<QikinkOrderPayload, "order_number"> = await req.json();

  try {
    const accessToken = await getQikinkToken();
    const clientId = process.env.QIKINK_CLIENT_ID!;
    const apiUrl = process.env.QIKINK_API_URL ?? "https://sandbox.qikink.com";

    const orderPayload: QikinkOrderPayload = {
      ...payload,
      order_number: generateOrderNumber(),
    };

    const res = await fetch(`${apiUrl}/api/order/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ClientId: clientId,
        Accesstoken: accessToken,
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[qikink order] failed response:", JSON.stringify(data));
      return Response.json(
        { error: data.message ?? JSON.stringify(data) ?? "Order creation failed" },
        { status: res.status }
      );
    }

    return Response.json({
      orderId: data.order_id,
      orderNumber: orderPayload.order_number,
      message: data.message,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Order failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
