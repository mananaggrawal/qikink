"use client";

import { useAppStore } from "@/store/useAppStore";
import { formatPrice } from "@/lib/utils";

export function OrderSummary() {
  const { selectedProduct, selectedSku, selectedPlacement, canvasDataUrl } = useAppStore();

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Order Summary</h3>

      {canvasDataUrl && (
        <div className="rounded-xl overflow-hidden border border-gray-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={canvasDataUrl} alt="Your design mockup" className="w-full h-auto" />
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Product</span>
          <span className="text-gray-200">{selectedProduct.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Variant</span>
          <span className="text-gray-200">{selectedSku.label}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Placement</span>
          <span className="text-gray-200">{selectedPlacement.label}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Qty</span>
          <span className="text-gray-200">1</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Shipping</span>
          <span className="text-gray-200">Qikink Managed</span>
        </div>
        <div className="border-t border-gray-800 pt-2 flex justify-between font-semibold">
          <span className="text-gray-300">Total</span>
          <span className="text-indigo-400 text-base">{formatPrice(selectedProduct.basePrice)}</span>
        </div>
      </div>
    </div>
  );
}
