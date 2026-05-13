import { getQikinkToken, invalidateQikinkToken } from "@/lib/qikink";
import { QikinkOrderPayload } from "@/types";
import { generateOrderNumber } from "@/lib/utils";

async function createOrder(orderPayload: QikinkOrderPayload, token: string) {
  const clientId = process.env.QIKINK_CLIENT_ID!;
  const apiUrl = process.env.QIKINK_API_URL ?? "https://sandbox.qikink.com";
  return fetch(`${apiUrl}/api/order/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ClientId: clientId,
      Accesstoken: token,
    },
    body: JSON.stringify(orderPayload),
  });
}

export async function POST(req: Request) {
  const payload: Omit<QikinkOrderPayload, "order_number"> = await req.json();

  try {
    const orderPayload: QikinkOrderPayload = {
      ...payload,
      order_number: generateOrderNumber(),
    };

    console.log("[qikink order] payload:", JSON.stringify(orderPayload, null, 2));
    let token = await getQikinkToken();
    let res = await createOrder(orderPayload, token);
    let data = await res.json();

    // If token was rejected, invalidate cache and retry once with a fresh token
    if (!res.ok && typeof data.error === "string" && data.error.toLowerCase().includes("accesstoken")) {
      invalidateQikinkToken();
      token = await getQikinkToken();
      res = await createOrder(orderPayload, token);
      data = await res.json();
    }

    if (!res.ok) {
      console.error("[qikink order] failed response:", JSON.stringify(data));
      return Response.json(
        { error: data.error ?? data.message ?? "Order creation failed" },
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
