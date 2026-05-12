"use client";

import { useAppStore } from "@/store/useAppStore";
import { AppStep } from "@/types";
import { cn } from "@/lib/utils";

const STEPS: { id: AppStep; label: string }[] = [
  { id: "design", label: "Design" },
  { id: "order", label: "Checkout" },
  { id: "success", label: "Done" },
];

export function StepIndicator() {
  const currentStep = useAppStore((s) => s.currentStep);
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center justify-center gap-0 py-4">
      {STEPS.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isActive = i === currentIndex;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                  isCompleted && "bg-indigo-600 text-white",
                  isActive && "bg-indigo-500 text-white ring-2 ring-indigo-300 ring-offset-2 ring-offset-gray-950",
                  !isCompleted && !isActive && "bg-gray-800 text-gray-500"
                )}
              >
                {isCompleted ? "✓" : i + 1}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive ? "text-indigo-400" : "text-gray-600"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-16 h-0.5 mb-4 mx-1 transition-all",
                  i < currentIndex ? "bg-indigo-600" : "bg-gray-800"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
