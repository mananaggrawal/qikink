"use client";

import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

export function ColorSelector() {
  const { selectedProduct, selectedColor, setColor } = useAppStore();

  if (!selectedProduct.colorOptions?.length) return null;

  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
        Color — <span className="text-gray-300 normal-case">{selectedColor?.name ?? "—"}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {selectedProduct.colorOptions.map((c) => {
          const isSelected = selectedColor?.id === c.id;
          const isLight = isLightColor(c.hex);
          return (
            <button
              key={c.id}
              title={c.name}
              onClick={() => setColor(c)}
              className={cn(
                "w-7 h-7 rounded-full border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
                isSelected
                  ? "border-indigo-400 scale-110 shadow-lg shadow-indigo-500/30"
                  : isLight
                  ? "border-gray-500 hover:border-gray-300"
                  : "border-transparent hover:border-gray-400"
              )}
              style={{ backgroundColor: c.hex }}
            />
          );
        })}
      </div>
    </div>
  );
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}
