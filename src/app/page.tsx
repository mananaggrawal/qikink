"use client";

import dynamic from "next/dynamic";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { OrderForm } from "@/components/order/OrderForm";
import { OrderSummary } from "@/components/order/OrderSummary";
import { OrderSuccess } from "@/components/order/OrderSuccess";
import { useAppStore } from "@/store/useAppStore";

const DesignStudio = dynamic(
  () => import("@/components/design/DesignStudio").then((m) => m.DesignStudio),
  { ssr: false, loading: () => <StudioSkeleton /> }
);

function StudioSkeleton() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  );
}

export default function Home() {
  const currentStep = useAppStore((s) => s.currentStep);

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🎨</span>
          <div>
            <h1 className="text-sm font-bold text-gray-100">AI Merch Studio</h1>
            <p className="text-xs text-gray-500">Powered by Qikink</p>
          </div>
        </div>
        <span className="text-xs text-gray-600 hidden sm:block">
          Design → Checkout → Done
        </span>
      </header>

      {/* Step indicator */}
      <div className="border-b border-gray-800/50">
        <StepIndicator />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentStep === "design" && (
          <div className="flex-1 p-4 lg:p-6 overflow-auto">
            <DesignStudio />
          </div>
        )}

        {currentStep === "order" && (
          <div className="flex-1 p-4 lg:p-6 overflow-auto">
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OrderForm />
              <div className="lg:sticky lg:top-6 h-fit">
                <OrderSummary />
              </div>
            </div>
          </div>
        )}

        {currentStep === "success" && (
          <div className="flex-1 p-4 lg:p-6 overflow-auto">
            <OrderSuccess />
          </div>
        )}
      </main>
    </div>
  );
}
