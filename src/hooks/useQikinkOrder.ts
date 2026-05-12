"use client";

import { useState, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { ShippingAddress, QikinkOrderPayload } from "@/types";

export function useQikinkOrder() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    selectedProduct,
    selectedSku,
    selectedPlacement,
    designUrl,
    mockupUrl,
    designDimensions,
    setOrderResult,
    setStep,
    setError,
  } = useAppStore();

  const submitOrder = useCallback(
    async (shippingAddress: ShippingAddress, paymentId?: string) => {
      if (!designUrl || !mockupUrl) {
        setSubmitError("Design or mockup URL is missing. Please complete the editor step.");
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      const payload: Omit<QikinkOrderPayload, "order_number"> = {
        qikink_shipping: "1",
        gateway: paymentId ? "Prepaid" : "COD",
        total_order_value: String(selectedProduct.basePrice),
        line_items: [
          {
            search_from_my_products: 0,
            quantity: "1",
            print_type_id: selectedProduct.printTypeId,
            price: String(selectedProduct.basePrice),
            sku: selectedSku.value,
            designs: [
              {
                design_code: `design${Date.now()}`,
                width_inches: designDimensions ? String(designDimensions.widthInches) : "10",
                height_inches: designDimensions ? String(designDimensions.heightInches) : "10",
                placement_sku: selectedPlacement.value,
                design_link: designUrl,
                mockup_link: mockupUrl,
              },
            ],
          },
        ],
        shipping_address: shippingAddress,
      };

      try {
        const res = await fetch("/api/qikink/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error ?? "Order creation failed");
        }

        setOrderResult({ orderId: data.orderId, orderNumber: data.orderNumber });
        setStep("success");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Order failed";
        setSubmitError(msg);
        setError(msg);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      selectedProduct,
      selectedSku,
      selectedPlacement,
      designUrl,
      mockupUrl,
      designDimensions,
      setOrderResult,
      setStep,
      setError,
    ]
  );

  return { submitOrder, isSubmitting, submitError };
}
