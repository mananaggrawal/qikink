"use client";

import { useState, useCallback } from "react";
import { ShippingAddress } from "@/types";
import { useQikinkOrder } from "./useQikinkOrder";

export function useRazorpay() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const { submitOrder } = useQikinkOrder();

  // Razorpay is mocked — checkout creates the Qikink order directly (COD)
  const initiatePayment = useCallback(
    async (shippingAddress: ShippingAddress) => {
      setIsProcessing(true);
      setPaymentError(null);
      try {
        await submitOrder(shippingAddress);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Order failed";
        setPaymentError(msg);
      } finally {
        setIsProcessing(false);
      }
    },
    [submitOrder]
  );

  return { initiatePayment, isProcessing, paymentError };
}
