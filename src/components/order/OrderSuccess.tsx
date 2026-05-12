"use client";

import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";

export function OrderSuccess() {
  const { orderResult, selectedProduct, selectedSku, canvasDataUrl, resetDesign } = useAppStore();

  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-green-900/50 border-2 border-green-500 flex items-center justify-center text-3xl">
        ✓
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2">Order Placed!</h2>
        <p className="text-gray-400">
          Your custom {selectedProduct.name} ({selectedSku.label}) is being sent to Qikink for
          printing and fulfillment.
        </p>
      </div>

      {orderResult && (
        <div className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-5 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order Number</span>
            <span className="text-gray-200 font-mono">{orderResult.orderNumber}</span>
          </div>
          {orderResult.orderId && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Qikink Order ID</span>
              <span className="text-gray-200 font-mono">{orderResult.orderId}</span>
            </div>
          )}
        </div>
      )}

      {canvasDataUrl && (
        <div className="w-48 rounded-xl overflow-hidden border border-gray-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={canvasDataUrl} alt="Your order" className="w-full h-auto" />
        </div>
      )}

      <p className="text-sm text-gray-400">
        Track your order at{" "}
        <a
          href="https://dashboard.qikink.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:underline"
        >
          dashboard.qikink.com
        </a>
      </p>

      <Button size="lg" onClick={resetDesign}>
        Create Another Design
      </Button>
    </div>
  );
}
