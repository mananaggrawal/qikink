"use client";

import { useState, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { ShippingAddress } from "@/types";
import { useQikinkOrder } from "./useQikinkOrder";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useRazorpay() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const { selectedProduct } = useAppStore();
  const { submitOrder } = useQikinkOrder();

  const initiatePayment = useCallback(
    async (shippingAddress: ShippingAddress) => {
      setIsProcessing(true);
      setPaymentError(null);

      try {
        const loaded = await loadRazorpayScript();
        if (!loaded) throw new Error("Failed to load Razorpay. Please check your connection.");

        const amountInPaise = selectedProduct.basePrice * 100;
        const orderRes = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amountInPaise, currency: "INR" }),
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok || orderData.error) {
          throw new Error(orderData.error ?? "Failed to create payment order");
        }

        await new Promise<void>((resolve, reject) => {
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "AI Merch Studio",
            description: `${selectedProduct.name} — Print on Demand`,
            order_id: orderData.id,
            prefill: {
              name: `${shippingAddress.first_name} ${shippingAddress.last_name}`.trim(),
              email: shippingAddress.email,
              contact: shippingAddress.phone,
            },
            theme: { color: "#6366f1" },
            handler: async (response: {
              razorpay_payment_id: string;
              razorpay_order_id: string;
              razorpay_signature: string;
            }) => {
              try {
                const verifyRes = await fetch("/api/razorpay/verify-payment", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(response),
                });
                const verifyData = await verifyRes.json();
                if (!verifyRes.ok || verifyData.error) {
                  throw new Error(verifyData.error ?? "Payment verification failed");
                }
                await submitOrder(shippingAddress, response.razorpay_payment_id);
                resolve();
              } catch (err) {
                reject(err);
              }
            },
            modal: {
              ondismiss: () => reject(new Error("__dismissed__")),
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Payment failed";
        if (msg !== "__dismissed__") {
          setPaymentError(msg);
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedProduct, submitOrder]
  );

  return { initiatePayment, isProcessing, paymentError };
}
